// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sunshine: {
          50:  "#F6F7F4",
          100: "#E8EBE2",
          200: "#D1D7C7",
          300: "#B3BDA3",
          400: "#8FA07A",
          500: "#6B8255",
          600: "#556A42",
          700: "#435435",
          800: "#37442C",
          900: "#2D3825",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};