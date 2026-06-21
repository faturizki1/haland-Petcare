import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2D6A4F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F7F5F2",
          foreground: "#1C1917",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F7F5F2",
          foreground: "#78716C",
        },
        accent: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1917",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1917",
        },
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#0284C7",
      },
      borderRadius: {
        lg: "8px",
        md: "8px",
        sm: "8px",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config