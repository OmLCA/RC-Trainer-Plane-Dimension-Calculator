/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blueprint: {
          dark: '#071322',
          navy: '#0b192c',
          line: '#38bdf8',
          accent: '#0284c7'
        }
      }
    },
  },
  plugins: [],
}
