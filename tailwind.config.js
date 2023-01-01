/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      fontFamily: {
        'body': ['Quicksand'],
        // 'body': ['"Playfair Display"'],
        'alt': ['"Source Sans Pro"'],
      },
    }
  },
  plugins: [],
}
