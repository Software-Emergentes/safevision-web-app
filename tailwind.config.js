/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C13515',
          dark: '#8B2810',
          darker: '#5A0000',
        },
        success: '#00CA75',
        warning: '#FFCD18',
        danger: '#C13515',
        info: '#0066CC',
        gray: {
          50: '#F8F9FA',
          100: '#F5F7FA',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#ADB5BD',
          500: '#74788D',
          900: '#222222',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
