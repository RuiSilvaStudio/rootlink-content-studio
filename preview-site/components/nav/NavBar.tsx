"use client";

/**
 * Simplified clone of RootLink's real `components/nav/NavBar.tsx`.
 * This clone is logged-out-only (no backend/auth), so every branch that
 * only renders `if (token)` in the real component -- donate icon,
 * notifications bell (SSE), create "+" menu, profile dropdown, moon-phase
 * widget -- has been removed rather than faked. The DOM/classes for the
 * always-visible logged-out state (wordmark, dropdown groups, theme toggle,
 * "Sign In" pill, mobile drawer + bottom bar) are unchanged from the real
 * component, so this matches production for an anonymous visitor.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Menu } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { DesktopDropdown } from "./DesktopDropdown";
import { MobileNav } from "./MobileNav";
import { MobileBottomBar } from "./MobileBottomBar";
import { desktopDropdowns } from "./NavConfig";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-stone-400 dark:text-stone-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/40 dark:hover:bg-primary-900/20 transition-colors"
      aria-label={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
}

export function NavBar() {
  const { t } = useLocale();

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "nav-glass" : "bg-cream/60 dark:bg-stone-950/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 lg:h-16 flex items-center justify-between gap-4 lg:gap-6">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 -ml-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-primary-50/60 dark:hover:bg-primary-900/20 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="font-display text-xl font-semibold tracking-tight leading-none select-none">
              <span className="text-stone-900 dark:text-stone-50">Root</span>
              <em className="text-primary-500 not-italic">Link</em>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {desktopDropdowns.map((group) => (
              <DesktopDropdown key={group.labelKey} group={group} />
            ))}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="hidden lg:inline-flex ml-1 px-4 py-1.5 rounded-xl2 bg-primary-600 text-cream text-sm font-display font-semibold hover:bg-primary-500 transition-colors shadow-xs shadow-primary-600/20"
            >
              <span data-cs-field="marketing-copy:nav.sign_in" data-cs-type="button">{t("nav.sign_in")}</span>
            </Link>
          </div>
        </div>
      </nav>

      <MobileNav drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />
      <MobileBottomBar />
    </>
  );
}
