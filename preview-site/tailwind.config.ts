import type { Config } from "tailwindcss";

/**
 * Runtime-themeable color pattern for Tailwind v3 (RootLink's real frontend
 * is on tailwindcss@3.4.x, not v4 -- v4 has this built in natively via
 * `@theme`, but v3 needs this manual wiring).
 *
 * Each shade resolves to a CSS custom property holding space-separated RGB
 * channels (e.g. `--color-primary-500: 122 96 64;`), wrapped in
 * `rgb(var(...) / <alpha-value>)`. This is what makes opacity modifiers
 * (`bg-primary-100/60`, `border-primary-200/40` -- used extensively in the
 * real RootLink components) keep working: Tailwind substitutes
 * `<alpha-value>` with the modifier's alpha at build time, same as any
 * normal color.
 *
 * The actual values live in `app/globals.css` `:root` as defaults (matching
 * RootLink's real hand-tuned palette exactly, so nothing looks different
 * until Content Studio overrides them), and get overridden at runtime by
 * injecting new `:root` custom property values -- no rebuild required.
 */
function withOpacity(cssVar: string) {
  return `rgb(var(${cssVar}) / <alpha-value>)`;
}

const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;

function themeableScale(family: string): Record<(typeof SHADES)[number], string> {
  return Object.fromEntries(SHADES.map((shade) => [shade, withOpacity(`--color-${family}-${shade}`)])) as Record<
    (typeof SHADES)[number],
    string
  >;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        serif: ["Source Serif 4", "Georgia", "serif"],
      },
      colors: {
        primary: themeableScale("primary"),
        earth: themeableScale("earth"),
        rust: themeableScale("rust"),
        cream: withOpacity("--color-cream"),
      },
      borderRadius: {
        xl2: "16px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "count-up": {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        "reveal-line": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
        "slide-in-left": "slide-in-left 0.5s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "count-up": "count-up 0.3s ease-out",
        "reveal-line": "reveal-line 1s ease-out 0.3s forwards",
        "shimmer": "shimmer 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
