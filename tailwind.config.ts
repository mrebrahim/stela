import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stella: {
          50:  '#f0f7ff',
          100: '#dcebfd',
          200: '#bcd6fa',
          400: '#3b8ce0',
          500: '#0e63c9',
          600: '#0b52a8',
          700: '#093f82',
          800: '#0a3162',
          900: '#062554',
          950: '#03152f'
        },
        sand: {
          50:  '#faf6ee',
          100: '#f5ecda',
          200: '#efe1c1',
          300: '#e2c896',
          400: '#d0ae6f',
          500: '#b7975a',
          600: '#9a7c43',
          700: '#7c6432',
          800: '#5c4a26'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        en:   ['var(--font-en)', 'var(--font-sans)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'card':      '0 6px 20px -8px rgba(15, 30, 60, 0.15)',
        'card-hover':'0 20px 45px -18px rgba(15, 30, 60, 0.35)'
      },
      backgroundImage: {
        'hero-fade': 'linear-gradient(180deg, rgba(3,21,47,.15) 0%, rgba(3,21,47,.55) 55%, rgba(3,21,47,.85) 100%)'
      }
    }
  },
  plugins: []
};
export default config;
