/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'town-deep': '#0a0c12',
        'town-twilight': '#1e293b',
        'town-warm': '#fbbf24',
      }
    },
  },
  plugins: [],
}
