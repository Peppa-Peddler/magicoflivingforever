/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        vibrate: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(0.8px, 0.8px)' },
          '50%': { transform: 'translate(-0.8px, -0.8px)' },
          '75%': { transform: 'translate(0.8px, -0.8px)' },
        },
      },
      animation: {
        vibrate: 'vibrate 0.3s infinite',
      },
    },
  },
  plugins: [],
}
