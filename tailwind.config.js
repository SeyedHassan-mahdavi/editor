module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // رنگ اولیه
        secondary: '#374151', // رنگ ثانویه
        accent: '#F5A623',
        background: '#F7F8FA',
        text: '#333333',
        gold: '#FFD700', // اضافه کردن رنگ طلایی

      },
    },
  },
  plugins: [],
}
