/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        panel: '#13131a',
        accent: {
          green: '#00e676',
          yellow: '#ffea00',
          red: '#ff1744',
          blue: '#00b0ff'
        }
      }
    },
  },
  plugins: [],
}
