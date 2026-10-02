import type { Config } from "tailwindcss";

// Colour tokens are stored as bare "H S% L%" triplets so Tailwind's opacity
// modifiers (bg-primary/20) resolve via the <alpha-value> placeholder.
const c = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        brand: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        border: c("border"),
        input: c("input"),
        ring: c("ring"),
        background: c("background"),
        foreground: c("foreground"),
        primary: { DEFAULT: c("primary"), hover: c("primary-hover"), foreground: c("primary-foreground") },
        secondary: { DEFAULT: c("secondary"), foreground: c("secondary-foreground") },
        destructive: { DEFAULT: c("destructive"), foreground: c("destructive-foreground") },
        muted: { DEFAULT: c("muted"), foreground: c("muted-foreground") },
        accent: { DEFAULT: c("accent"), foreground: c("accent-foreground") },
        popover: { DEFAULT: c("popover"), foreground: c("popover-foreground") },
        card: { DEFAULT: c("card"), foreground: c("card-foreground") },
        surface: { DEFAULT: c("surface") },
        profit: { DEFAULT: c("profit"), foreground: c("profit-foreground") },
        loss: { DEFAULT: c("loss"), foreground: c("loss-foreground") },
        warning: { DEFAULT: c("warning"), foreground: c("warning-foreground") },
        ember: { DEFAULT: c("ember"), 300: c("ember-300"), 700: c("ember-700") },
        ios: {
          blue: c("ios-blue"), green: c("ios-green"), red: c("ios-red"), orange: c("ios-orange"),
          yellow: c("ios-yellow"), teal: c("ios-teal"), mint: c("ios-mint"), indigo: c("ios-indigo"),
          purple: c("ios-purple"), pink: c("ios-pink"), gray: c("ios-gray"),
        },
      },
      borderRadius: {
        lg: "var(--r-md)", md: "var(--r-sm)", sm: "var(--r-xs)",
        "2xl": "var(--r-lg)", "3xl": "var(--r-xl)", "4xl": "var(--r-2xl)",
      },
      boxShadow: {
        1: "var(--shadow-1)", 2: "var(--shadow-2)", 3: "var(--shadow-3)", float: "var(--shadow-float)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)", spring: "var(--ease-spring)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s var(--ease-out) both",
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
