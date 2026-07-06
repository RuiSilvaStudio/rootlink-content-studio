"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditPanel } from "./EditPanel";

interface FieldInfo {
  collection: string;
  key: string;
  label: string;
  currentValue: string;
  element: HTMLElement;
  csType: string | null;
  linkUrl: string | null;
}

/**
 * Reads `data-cs-field="collection:key"` attributes on the page and makes
 * them hoverable/clickable. On click, opens a floating EditPanel.
 *
 * Activate with ?edit=1 in the URL.
 */
export function EditableOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [activeField, setActiveField] = useState<FieldInfo | null>(null);
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setEnabled(params.get("edit") === "1");
    }
  }, []);

  const resolveLabel = useCallback((collection: string, key: string) => {
    const parts = key.split(".");
    const raw = parts[parts.length - 1] || key;
    return raw
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, []);

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;
      const target = (e.target as HTMLElement).closest("[data-cs-field]") as HTMLElement | null;
      if (!target || !highlightRef.current) return;
      const rect = target.getBoundingClientRect();
      highlightRef.current.style.cssText = `
        position: fixed;
        left: ${rect.left - 4}px;
        top: ${rect.top - 4}px;
        width: ${rect.width + 8}px;
        height: ${rect.height + 8}px;
        border: 1.5px solid #a8643d;
        border-radius: 4px;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.12s ease;
        opacity: 1;
      `;
    },
    [enabled],
  );

  const handleMouseOut = useCallback(() => {
    if (!highlightRef.current) return;
    highlightRef.current.style.opacity = "0";
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;
      const target = (e.target as HTMLElement).closest("[data-cs-field]") as HTMLElement | null;
      if (!target) {
        setActiveField(null);
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const raw = target.getAttribute("data-cs-field") || "";
      const [collection, ...keyParts] = raw.split(":");
      const key = keyParts.join(":");
      const csType = target.getAttribute("data-cs-type");
      const rect = target.getBoundingClientRect();

      // For buttons, find the parent <a> or <button> to get the link URL
      let linkUrl: string | null = null;
      if (csType === "button") {
        const parentLink = target.closest("a, button") as HTMLAnchorElement | HTMLButtonElement | null;
        if (parentLink && "href" in parentLink) {
          linkUrl = (parentLink as HTMLAnchorElement).getAttribute("href");
        }
      }

      const label = resolveLabel(collection, key);
      const msg = {
        type: "content-studio:select-field",
        collection,
        key,
        label,
        csType: csType || undefined,
        linkUrl: linkUrl || undefined,
        currentValue: target.textContent?.trim() || "",
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      };

      // If we're inside the Content Studio dashboard, send a postMessage
      // so the right sidebar can handle editing with proper auth.
      if (window.parent !== window) {
        window.parent.postMessage(msg, "*");
        return;
      }

      // Standalone mode (directly at localhost:3011/?edit=1 without the dashboard)
      setActiveField({
        collection,
        key,
        label: resolveLabel(collection, key),
        currentValue: target.textContent?.trim() || "",
        element: target,
        csType,
        linkUrl,
      });

      setPanelPos({
        x: Math.min(rect.left, window.innerWidth - 380),
        y: rect.bottom + 12,
      });
    },
    [enabled, resolveLabel],
  );

  useEffect(() => {
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });
    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [handleMouseOver, handleMouseOut, handleClick]);

  const saveField = async (value: string): Promise<boolean> => {
    if (!activeField) return false;
    // Update DOM immediately for instant visual feedback
    activeField.element.textContent = value;
    setActiveField({ ...activeField, currentValue: value });

    if (activeField.collection === "marketing-copy") {
      try {
        const base = process.env.NEXT_PUBLIC_CONTENT_STUDIO_URL || "http://localhost:3010";
        const searchRes = await fetch(
          `${base}/api/marketing-copy?where[key][equals]=${encodeURIComponent(activeField.key)}&limit=1`,
          { credentials: "include" }
        );
        const searchData = await searchRes.json();
        const existing = searchData?.docs?.[0];
        const method = existing ? "PATCH" : "POST";
        const url = existing
          ? `${base}/api/marketing-copy/${existing.id}`
          : `${base}/api/marketing-copy`;
        const body = existing
          ? { value, locale: "en" }
          : { key: activeField.key, value, locale: "en" };
        await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  if (!enabled) return null;

  return (
    <>
      <div ref={highlightRef} style={{ opacity: 0 }} />

      {/* Edit mode indicator pill — top-right */}
      <div
        style={{
          position: "fixed",
          top: 72,
          right: 16,
          zIndex: 10000,
          background: "#a8643d",
          color: "#fff",
          padding: "6px 14px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 2px 12px rgba(168,100,61,0.3)",
        }}
      >
        Edit mode — click any text to edit
      </div>

      {activeField && (
        <EditPanel
          field={activeField}
          position={panelPos}
          onClose={() => setActiveField(null)}
          onSave={saveField}
        />
      )}
    </>
  );
}
