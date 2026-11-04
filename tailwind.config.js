/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          dark: '#121316',
          panel: '#1e2124',
          metal: '#2c3036',
          border: '#3d444d',
          gold: '#cba864',
          amber: '#e69a28',
          crt: '#39ff14',
          crtglow: 'rgba(57, 255, 20, 0.4)',
          rail: '#787062',
          wire: '#e2d5b8'
        }
      },
      fontFamily: {
        mono: ['Courier New', 'monospace', 'Courier'],
        retro: ['Trebuchet MS', 'sans-serif']
      }
    },
  },
  plugins: [],
}
