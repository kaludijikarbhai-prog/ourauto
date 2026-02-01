module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        secondary: '#F97316',
        accent: '#06B6D4',
        blue: {
          100: '#DBEAFE',
          500: '#3B82F6',
          700: '#1D4ED8',
        },
        green: {
          600: '#16A34A',
        },
        red: {
          600: '#DC2626',
        },
        yellow: {
          600: '#CA8A04',
        },
      },
    },
  },
  plugins: [],
};
