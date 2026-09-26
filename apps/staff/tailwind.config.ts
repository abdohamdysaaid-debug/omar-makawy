import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8F5EE',
          100: '#C5E8D4',
          200: '#8ED1AA',
          300: '#57BA80',
          400: '#2ECC71',
          500: '#1B7A4B',
          600: '#145A38',
          700: '#0E3F27',
          800: '#082518',
          900: '#041209',
        },
        warm: {
          50: '#FDFCF9',
          100: '#FAF7F0',
          200: '#F5F0E8',
          300: '#EDE4D3',
          400: '#D4C5A9',
          500: '#B8A47E',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#141414',
        },
        background: {
          light: '#FAFAF5',
          dark: '#0A0A0A',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
