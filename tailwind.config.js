/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // className="font-title" 로 사용할 수 있게 설정
        title: ['var(--font-polymath)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};