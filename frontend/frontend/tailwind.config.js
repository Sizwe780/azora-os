/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        azora: {
          cyan: '#06b6d4',
          purple: '#7e22ce',
          pink: '#ec4899'
        }
      }
    },
  },
  plugins: [],
}
