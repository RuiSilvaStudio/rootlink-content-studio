"use client";

/**
 * Simplified clone of RootLink's real `components/nav/MobileBottomBar.tsx`,
 * fixed to the logged-out state: Create is always disabled, Updates always
 * shows no badge, and the last tab is always "Sign In" (never the avatar
 * "You" tab) -- matching what an anonymous visitor sees on the real site.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Plus, Bell, LogIn } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

export function MobileBottomBar() {
  const { t } = useLocale();
  const pathname = usePathname();

  const tabCls = (active: boolean) =>
    `flex flex-col items-center justify-center gap-[3px] flex-1 py-2.5 transition-colors ${
      active
        ? "text-primary-600 dark:text-primary-400"
        : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe" aria-label="Mobile navigation">
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 flex items-end">
        <Link href="/" className={tabCls(pathname === "/")}>
          <Home className="w-5 h-5" strokeWidth={pathname === "/" ? 2 : 1.5} />
          <span className="text-[10px] font-display font-medium leading-none">{t("nav.home")}</span>
        </Link>

        <Link href="/learning" className={tabCls(pathname.startsWith("/learning"))}>
          <BookOpen className="w-5 h-5" strokeWidth={pathname.startsWith("/learning") ? 2 : 1.5} />
          <span className="text-[10px] font-display font-medium leading-none">{t("nav.learning")}</span>
        </Link>

        <div className="flex flex-col items-center flex-1 pb-[env(safe-area-inset-bottom,0px)]">
          <button
            disabled
            aria-label={t("create.button")}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-7 transition-all duration-150 bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <span className="text-[10px] font-display font-medium leading-none mt-1 mb-0.5 text-stone-300 dark:text-stone-600">
            {t("create.button")}
          </span>
        </div>

        <button disabled className={`${tabCls(false)} relative opacity-40 cursor-not-allowed`} aria-label={t("nav.updates")}>
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] font-display font-medium leading-none">{t("nav.updates")}</span>
        </button>

        <Link href="/auth/login" className={tabCls(false)} aria-label={t("nav.sign_in")}>
          <LogIn className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[10px] font-display font-medium leading-none">{t("nav.sign_in")}</span>
        </Link>
      </div>
    </nav>
  );
}
