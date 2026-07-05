"use client";

/**
 * Simplified clone of RootLink's real `components/nav/MobileNav.tsx`.
 * Only the hamburger drawer is implemented -- the real component's
 * create/notifications/profile bottom sheets are only reachable via buttons
 * that require `token` (logged-in), which this logged-out-only clone never
 * has, so those sheets are unreachable dead code here and were removed
 * rather than faked.
 */
import Link from "next/link";
import { X, Search, Users, CalendarDays, Network, Building2, Rss, Leaf, BookOpen, Wrench, ShoppingBag, Sprout, RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

export function MobileNav({ drawerOpen, onCloseDrawer }: { drawerOpen: boolean; onCloseDrawer: () => void }) {
  const { t } = useLocale();

  return (
    <>
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] bg-stone-950/60 backdrop-blur-sm lg:hidden" onClick={onCloseDrawer} />
      )}

      {drawerOpen && (
        <div className="fixed inset-y-0 left-0 z-[70] w-[min(85vw,320px)] bg-white dark:bg-stone-900 flex flex-col overflow-hidden lg:hidden animate-drawer-in border-r border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between px-4 h-14 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
            <span className="font-display text-xl font-semibold tracking-tight leading-none">
              <span className="text-stone-900 dark:text-stone-50">Root</span>
              <em className="text-primary-500 not-italic">Link</em>
            </span>
            <button
              onClick={onCloseDrawer}
              className="p-2 -mr-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-primary-50/60 dark:hover:bg-primary-900/20 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {[
              {
                label: t("nav.discover"),
                items: [
                  { href: "/search", label: t("nav.search"), Icon: Search },
                  { href: "/groups", label: t("nav.groups"), Icon: Users },
                  { href: "/events", label: t("nav.events"), Icon: CalendarDays },
                  { href: "/network", label: t("nav.network"), Icon: Network },
                  { href: "/entities", label: t("nav.entities"), Icon: Building2 },
                  { href: "/feed", label: t("nav.feed"), Icon: Rss },
                ],
              },
              {
                label: t("nav.grow"),
                items: [
                  { href: "/plants", label: t("nav.plants"), Icon: Leaf },
                  { href: "/learning", label: t("nav.learning"), Icon: BookOpen },
                  { href: "/tools", label: t("nav.tools"), Icon: Wrench },
                ],
              },
              {
                label: t("nav.exchange"),
                items: [
                  { href: "/marketplace", label: t("nav.marketplace"), Icon: ShoppingBag },
                  { href: "/composting", label: t("nav.composting"), Icon: Sprout },
                  { href: "/upcycling", label: t("nav.upcycling"), Icon: RefreshCw },
                ],
              },
            ].map((section) => (
              <div key={section.label}>
                <p className="text-[10px] font-display font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1.5 px-1">
                  {section.label}
                </p>
                <div className="grid grid-cols-2 gap-0.5">
                  {section.items.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={onCloseDrawer}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-primary-50/60 dark:hover:bg-primary-900/20 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-primary-500" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-200 dark:border-stone-800 p-3 flex-shrink-0 pb-safe">
            <Link
              href="/auth/login"
              onClick={onCloseDrawer}
              className="block w-full text-center px-4 py-2.5 rounded-xl2 text-sm bg-primary-600 text-cream font-display font-semibold hover:bg-primary-500 transition-colors"
            >
              {t("nav.sign_in")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
