/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1a1a1a',
          dark: '#ffffff',
        },
        secondary: {
          DEFAULT: '#2d2d2d',
          dark: '#1f2937',
        },
        accent: {
          DEFAULT: '#4a90e2',
          dark: '#60a5fa',
        },
        'accent-foreground': '#ffffff',
        surface: {
          DEFAULT: '#f5f5f5',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        success: {
          DEFAULT: '#27ae60',
          dark: '#34d399',
        },
        'success-foreground': '#ffffff',
        warning: {
          DEFAULT: '#f39c12',
          dark: '#fbbf24',
        },
        'warning-foreground': '#ffffff',
        error: {
          DEFAULT: '#e74c3c',
          dark: '#f87171',
        },
        info: {
          DEFAULT: '#3498db',
          dark: '#60a5fa',
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
}