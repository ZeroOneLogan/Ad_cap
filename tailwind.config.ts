import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './apps/web/app/**/*.{js,ts,jsx,tsx}',
    './apps/web/components/**/*.{js,ts,jsx,tsx}',
    './packages/ui-kit/src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7ff',
          100: '#e6ecff',
          200: '#c2ceff',
          300: '#96a7ff',
          400: '#6682ff',
          500: '#4b67ff',
          600: '#354dd7',
          700: '#2539a9',
          800: '#1a287c',
          900: '#111b59'
        }
      }
    }
  },
  plugins: []
};

export default config;
