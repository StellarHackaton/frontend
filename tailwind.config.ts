import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#15161B",
        paper: "#FBFAF7",
        canvas: "#DDD9D1",
        primary: {
          DEFAULT: "#2F2A6B",
          pressed: "#24205A",
          soft: "#ECEBF4",
        },
        success: "#1F9D78",
        muted: "#6B6A73",
        // Darkened from #9B9AA1 — that shade sat at ~2.7:1 contrast on
        // `paper`, failing WCAG AA for the small (11-13px) text it's used
        // for app-wide. This hits ~4.57:1.
        faint: "#737278",
        danger: "#D14343",
      },
      fontFamily: {
        display: ["var(--font-hanken)", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        btn: "16px",
      },
      boxShadow: {
        card: "0 6px 18px rgba(21,22,27,.06)",
        glass:
          "0 10px 28px rgba(21,22,27,.10), inset 0 1px 0 rgba(255,255,255,.9)",
        sheet:
          "0 -14px 50px rgba(21,22,27,.22), inset 0 1px 0 rgba(255,255,255,.9)",
        btnPrimary:
          "0 14px 30px rgba(47,42,107,.34), inset 0 1px 0 rgba(255,255,255,.22)",
        phone:
          "0 40px 100px rgba(21,22,27,.28), 0 6px 18px rgba(21,22,27,.12)",
      },
      keyframes: {
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
        rise: {
          from: { transform: "translateY(16px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slide: {
          from: { transform: "translateY(26px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        sheet: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(.6)", opacity: "0" },
          "62%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        halo: {
          "0%": { transform: "scale(.55)", opacity: ".55" },
          "100%": { transform: "scale(2.1)", opacity: "0" },
        },
        wobble: {
          "0%,100%": { transform: "scale(1)", borderRadius: "50%" },
          "50%": { transform: "scale(1.07)", borderRadius: "47% 53% 51% 49%" },
        },
        loaderDot: {
          "0%, 80%, 100%": { transform: "translateY(0) scale(.72)", opacity: ".45" },
          "40%": { transform: "translateY(-9px) scale(1)", opacity: "1" },
        },
      },
      animation: {
        fade: "fade .5s ease both",
        rise: "rise .5s ease both",
        slide: "slide .5s ease both",
        sheet: "sheet .4s cubic-bezier(.32,1.4,.4,1) both",
        pop: "pop .5s ease both",
        halo: "halo .9s ease-out both",
        wobble: "wobble 2.2s ease-in-out infinite",
        loaderDot: "loaderDot 1.1s cubic-bezier(.45,0,.55,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
