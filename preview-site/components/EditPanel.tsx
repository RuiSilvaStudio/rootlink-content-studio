"use client";

import React, { useRef, useState } from "react";

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
 * Floating edit panel. Adapts to element type:
 * - Button (csType=button): shows link URL + text
 * - Default: shows textarea only
 */
export function EditPanel({
  field,
  position,
  onClose,
  onSave,
}: {
  field: FieldInfo;
  position: { x: number; y: number };
  onClose: () => void;
  onSave: (value: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState(field.currentValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(value);
    setSaving(false);
    setSaved(!!ok);
    setTimeout(() => setSaved(false), 1500);
  };

  const panelHeight = field.currentValue.length > 60 ? 200 : 170;

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "transparent",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          left: Math.max(8, position.x),
          top: Math.min(position.y, window.innerHeight - panelHeight - 16),
          zIndex: 10001,
          width: 360,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 40px rgba(41,31,22,0.18), 0 0 0 1px rgba(99,77,51,0.08)",
          overflow: "hidden",
          animation: "cs-panel-in 0.16s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 18px 0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#3d2f21",
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            >
              {field.csType === "button" ? "Button" : field.label}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#917a56",
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: 2,
              }}
            >
              {field.key}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#ad9a7a",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 18px 18px" }}>
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={field.currentValue.length > 60 ? 3 : 2}
            style={{
              width: "100%",
              border: "1px solid #cabda6",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 14,
              fontFamily: "'Source Serif 4', Georgia, serif",
              lineHeight: 1.5,
              color: "#3d2f21",
              background: "#fafaf7",
              resize: "none",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#7a6040";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#cabda6";
            }}
          />

          {field.csType === "button" && field.linkUrl ? (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 6,
                background: "#f5f0ea",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#917a56",
              }}
            >
              <span style={{ opacity: 0.5 }}>→</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {field.linkUrl}
              </span>
            </div>
          ) : null}

          {/* Character count */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#ad9a7a",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {value.length} characters
            </span>
            <button
              onClick={handleSave}
              disabled={saving || value === field.currentValue}
              style={{
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Source Serif 4', Georgia, serif",
                cursor: value === field.currentValue ? "default" : "pointer",
                background: saved
                  ? "#10b981"
                  : value === field.currentValue
                    ? "#e3ddd0"
                    : "#634d33",
                color: saved ? "#fff" : value === field.currentValue ? "#ad9a7a" : "#f8f6f2",
                transition: "all 0.2s",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cs-panel-in {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
