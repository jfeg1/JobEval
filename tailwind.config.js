/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
  plugins: [],
}
