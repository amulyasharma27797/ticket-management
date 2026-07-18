import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 2s infinite",
        "float-slow": "float 12s ease-in-out 1s infinite",
        "mesh-shift": "mesh-shift 18s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "scale-in": "scale-in 0.4s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-18px) scale(1.03)" },
        },
        "mesh-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "auth-sparkle": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.5)" },
        },
        "auth-float": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-22px) scale(1.04)" },
        },
        "auth-drift": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(14px, -16px) rotate(2deg)" },
          "66%": { transform: "translate(-10px, -24px) rotate(-2deg)" },
        },
      },
      boxShadow: {
        glow: "0 0 40px -8px rgb(14 165 233 / 0.45)",
        "glow-lg": "0 0 60px -12px rgb(14 165 233 / 0.5)",
        card: "0 1px 3px rgb(15 23 42 / 0.04), 0 8px 24px -4px rgb(15 23 42 / 0.08)",
        "card-hover": "0 4px 12px rgb(15 23 42 / 0.06), 0 16px 40px -8px rgb(14 165 233 / 0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;
