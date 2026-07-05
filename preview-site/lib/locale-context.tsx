"use client";

/**
 * Simplified clone of RootLink's real `lib/locale-context.tsx`.
 * Same t()/flatten/interpolate behavior. The real component's `/api/copy`
 * fetch (RootLink's own backend) is replaced with a fetch against Content
 * Studio's public `marketing-copy` API -- same override-merge pattern, same
 * i18n keys, different (and disposable, for now) source of truth. See repo
 * README's "Integration with RootLink" section.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type Locale = "pt" | "en";

const LOCALE_KEY = "rootlink_locale";
const FALLBACK_LOCALE: Locale = "pt";

type Messages = Record<string, string | Record<string, any>>;

type LocaleContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  loading: boolean;
};

const LocaleContext = createContext<LocaleContextType | null>(null);

async function loadMessages(locale: Locale): Promise<Messages> {
  try {
    const mod = await import(`@/messages/${locale}.json`);
    return mod.default || mod;
  } catch {
    return {};
  }
}

function flatten(obj: Messages, prefix = ""): Record<string, string> {
  let result: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    const k = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "string") {
      result[k] = val;
    } else if (val && typeof val === "object") {
      result = { ...result, ...flatten(val as Messages, k) };
    }
  }
  return result;
}

function interpolate(tpl: string, vars?: Record<string, string | number>): string {
  if (!vars) return tpl;
  return tpl.replace(/\{(\w+)\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return FALLBACK_LOCALE;
  const lang = navigator.language || "";
  if (lang.startsWith("pt")) return "pt";
  return "en";
}

type MarketingCopyDoc = { key: string; locale?: string; value: string };

async function loadContentStudioOverrides(locale: Locale): Promise<Record<string, string>> {
  const base = process.env.NEXT_PUBLIC_CONTENT_STUDIO_URL || "http://localhost:3010";
  try {
    const res = await fetch(
      `${base}/api/marketing-copy?where[locale][equals]=${locale}&limit=200&depth=0`,
      { cache: "no-store" },
    );
    if (!res.ok) return {};
    const data = await res.json();
    const docs: MarketingCopyDoc[] = data?.docs || [];
    const overrides: Record<string, string> = {};
    for (const doc of docs) {
      if (doc.key) overrides[doc.key] = doc.value;
    }
    return overrides;
  } catch {
    // Content Studio unreachable -- fall back to static bundled copy only.
    return {};
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(FALLBACK_LOCALE);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (stored === "pt" || stored === "en") {
      setLocaleState(stored);
    } else {
      setLocaleState(detectBrowserLocale());
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    (async () => {
      const [base, overrides] = await Promise.all([
        loadMessages(locale).then(flatten),
        loadContentStudioOverrides(locale),
      ]);
      if (cancelled) return;
      setMessages({ ...base, ...overrides });
      localStorage.setItem(LOCALE_KEY, locale);
      document.documentElement.lang = locale;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const val = messages[key];
      if (val === undefined) return key;
      return interpolate(val, vars);
    },
    [messages],
  );

  return <LocaleContext.Provider value={{ locale, setLocale, t, loading }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
