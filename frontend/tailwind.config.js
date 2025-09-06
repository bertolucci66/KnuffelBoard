/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        casino: {
          "primary": "#D4AF37", // gold
          "primary-content": "#141414",
          "secondary": "#2dd4bf",
          "accent": "#fbbf24",
          "neutral": "#1f2937",
          // paper-like neutrals for components (high contrast vs. green felt bg)
          "base-100": "#faf7ef", // warm off-white paper
          "base-200": "#f0ece3",
          "base-300": "#e5e1d5",
          "info": "#38bdf8",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1rem",
          "--animation-btn": "0.25s",
          "--btn-text-case": "",
          "--navbar-padding": "0.5rem",
          "--border-btn": "1px"
        }
      },
      "light",
      "dark",
      "cupcake"
    ],
    darkTheme: "dark"
  }
};
