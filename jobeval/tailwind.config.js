/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2c3e50',
          light: '#34495e',
        },
        accent: {
          DEFAULT: '#3498db',
          light: '#e8f4f8',
        },
        sage: {
          50: '#f6f8f6',
          100: '#e8ece8',
          200: '#d1dbd1',
          300: '#a8bca8',
          400: '#7a9a7a',
          500: '#5a7d5a',
          600: '#466446',
          700: '#3a513a',
          800: '#2f422f',
          900: '#283728',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        gray: {
          50: '#fafafa',
          100: '#f8f9fa',
          200: '#ecf0f1',
          300: '#e0e0e0',
          400: '#bdc3c7',
          500: '#95a5a6',
          600: '#7f8c8d',
          700: '#2c3e50',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}
