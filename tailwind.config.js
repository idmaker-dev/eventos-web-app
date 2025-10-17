/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        porcelain: '#EAF0F3',
        towerGray: '#A1BAC4',
        casal: '#246370',
        Acapulco: '#72B7A4',
        fuscousGray: '#4D4D4D',
        grey: '#808080',
        silver: '#CBCBCB',
        blackHaze: '#F7F7F7',
        fodoBlack: '#2a2a2a',
        fondoGris: '#f6f6f6',
        cafe: '#C28F4E',
        fondoVs: '#e9f0f6',
        verde2: '#7FB069',
        rojop: '#F46E81',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // o 'media', pero 'class' es más flexible
};
