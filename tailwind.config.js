/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
      "./apps/main-app/src/**/*.{js,jsx,ts,tsx}",  // Add this to include the app files
    ],
    darkMode: "class",
    theme: { extend: {} },
    plugins: [require("tailwindcss-animate")],  // Add the plugin here
  };