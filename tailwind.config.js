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
        casalds: {
          '50': '#eefdfd',
          '100': '#d5f7f8',
          '200': '#b0eef1',
          '300': '#7ae0e6',
          '400': '#3dc9d3',
          '500': '#21adb9',
          '600': '#1e8c9c',
          '700': '#1f717f',
          '800': '#246370',
          '900': '#204d59',
          '950': '#10333c',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class', // o 'media', pero 'class' es más flexible
};
