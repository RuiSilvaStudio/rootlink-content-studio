"use client";

/**
 * Simplified clone of RootLink's real `app/layout.tsx`. Same nav-glass/pt-16
 * page shell and dark-mode bootstrap script, but with AuthProvider,
 * ToastProvider, EditorModeProvider, CommandPalette, and EditorModeChrome
 * removed -- this clone is a public/logged-out-only marketing-page render
 * target with no backend, so none of those have anything to do.
 */
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LocaleProvider, useLocale } from "@/lib/locale-context";
import { NavBar } from "@/components/nav/NavBar";
import { Footer } from "@/components/Footer";
import { ThemeVarsInjector } from "@/components/ThemeVarsInjector";
import { EditableOverlay } from "@/components/EditableOverlay";
import { useEffect } from "react";
import "./globals.css";

function LangUpdater() {
  const { locale } = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="pt" className="noise-bg" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#7a6040" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var stored = localStorage.getItem('theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (stored === 'dark' || (!stored && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <LocaleProvider>
          <LangUpdater />
          <ThemeVarsInjector />
          <NavBar />
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex-1 pt-16 pb-20 lg:pb-0"
            >
              {children}
            </motion.main>
          </AnimatePresence>
          <Footer />
          <EditableOverlay />
        </LocaleProvider>
      </body>
    </html>
  );
}
