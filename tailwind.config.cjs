/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2b7fff',
        'primary-hover': '#1b6ee6',
        'primary-light': '#f1f6ff',
        navy: '#0A1628',
        page: '#F8FAFF',
        text: '#09090b',
        muted: '#71717b',
        border: '#e4e4e7',
        surface: '#ffffff',
        danger: '#dc2626',
        success: '#16a34a',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
      },
      borderRadius: {
        DEFAULT: '5px',
        sm: '5px',
        md: '5px',
        lg: '5px',
        xl: '5px',
        '2xl': '5px',
        '3xl': '5px',
      },
    },
  },
  plugins: [],
}
