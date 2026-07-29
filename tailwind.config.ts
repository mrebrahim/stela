import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stella: {
          50:  '#f0f7ff',
          100: '#dcebfd',
          500: '#0e63c9',
          600: '#0b52a8',
          700: '#093f82',
          900: '#062554'
        },
        sand: {
          50:  '#faf6ee',
          200: '#efe1c1',
          500: '#b7975a',
          700: '#7c6432'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
export default config;
