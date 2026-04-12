/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zomato-red': '#EF4F5F',
        'zomato-dark': '#1C1C1C',
        'zomato-gray': '#696969',
        'rating-green': '#24963F',
        'rating-orange': '#FF7E00',
      },
      container: {
        center: true,
        padding: '1rem',
      }
    },
  },
  plugins: [],
}
