/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5ED',
          100: '#FFE8D6',
          200: '#FFD4AD',
          300: '#FFBC7A',
          400: '#FF9C4A',
          500: '#FF8C42',
          600: '#FF7A2E',
          700: '#F56A1D',
          800: '#E05A10',
          900: '#C24A05',
        },
        warm: {
          50: '#FFFBF5',
          100: '#FFF4E6',
          200: '#FFE8CC',
          300: '#FFD9A8',
          400: '#FFC780',
          500: '#FFB366',
        },
        mint: {
          400: '#6BCB77',
          500: '#52BE80',
          600: '#45A66D',
        },
        sky: {
          400: '#4D96FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
        sakura: {
          400: '#FF8FB1',
          500: '#FF6B9D',
          600: '#F43F5E',
        },
        note: {
          yellow: '#FFF3CD',
          pink: '#FFD6E0',
          blue: '#D4E7FF',
          green: '#D4F5D7',
          purple: '#E8D5FF',
          orange: '#FFE0B2',
        }
      },
      fontFamily: {
        sans: ['"Nunito"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        display: ['"Quicksand"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        note: '2px 2px 8px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};
