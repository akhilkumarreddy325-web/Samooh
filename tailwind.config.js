/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F7F6F2',
        surface: '#FFFFFF',
        surfaceMuted: '#F8FAFC',
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          600: '#166534',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          DEFAULT: '#166534',
        },
        card: '#FFFFFF',
        cardHover: '#F8FAFC',
        accentBlue: '#2563EB',
        accentPurple: '#6366F1',
        accentGreen: '#16A34A',
        darkBorder: '#334155',
        darkMuted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
