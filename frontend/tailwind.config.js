/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nyaman: '#22c55e',
        waspada: '#f59e0b',
        bahaya: '#ef4444',
      },
    },
  },
  plugins: [],
}
