/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#D4230A",
        "primary-glow": "#ef233c",
        "accent": "#ffb703",
        "gold": "#FFD700",
        "peach": "#FFE5D9",
        "blush": "#FFF0EB",
        "background-dark": "#1a1816",
        "surface-dark": "#231f1d",
        "surface-darker": "#1a1715",
        "card-dark": "#2a2522",
        "background-light": "#FFF5F0",
        "surface-light": "#FFFAF7",
        "card-light": "#FFFFFF",
        "text-primary": "#ffffff",
        "text-secondary": "#b8a898",
        "text-light-main": "#2D1810",
        "text-light-secondary": "#6B4423",
        // Tet theme specific
        "tet-red": "#D4230A",
        "tet-red-dark": "#B01C08",
        "tet-yellow": "#F5A623",
        "tet-gold": "#FFD700",
        "tet-bg": "#FDF6EC",
        "tet-sidebar": "#1A0A05",
        "tet-card-border": "#F5E6D0",
        "tet-text": "#2D1810",
        "tet-text-muted": "#8B6355",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
        "serif": ["Playfair Display", "serif"],
        "vietnam": ['"Be Vietnam Pro"', "sans-serif"],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(217, 4, 41, 0.3)',
        'glow-accent': '0 0 15px rgba(255, 183, 3, 0.2)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}