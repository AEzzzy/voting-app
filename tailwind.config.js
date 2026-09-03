/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'jewel': "url('/bg.jpg')",
      },
      fontFamily: {
        sans: ['KanzalLulu', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
