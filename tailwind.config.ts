import type { Config } from "tailwindcss";

/**
 * Design System "Bispo" — paleta inspirada no xadrez.
 * Verde estratégia (#52623e) · Azul visão (#00377e) · Branco clareza (#f8f8f8)
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bispo: {
          green: "#52623e",
          "green-dark": "#3c4a2c",
          "green-light": "#6b7d52",
          blue: "#00377e",
          "blue-dark": "#002658",
          "blue-light": "#1a56b0",
          white: "#f8f8f8",
          ink: "#0f1411",
        },
        // tokens semânticos consumidos pela UI
        background: "#f8f8f8",
        surface: "#ffffff",
        border: "#e6e8e3",
        foreground: "#0f1411",
        muted: "#6b7280",
        positive: "#2f9e63",
        warning: "#d6a52a",
        critical: "#cf3a3a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,20,17,0.04), 0 8px 24px -12px rgba(15,20,17,0.12)",
        "card-hover": "0 2px 4px rgba(15,20,17,0.06), 0 16px 40px -16px rgba(15,20,17,0.2)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
