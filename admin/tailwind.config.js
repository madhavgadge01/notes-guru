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
        brand: {
          50: '#FFF7F0',
          100: '#FDEEE4',
          200: '#FBDCC9',
          300: '#F7BF9E',
          400: '#F4A373',
          500: '#F28C52', // Warm Sunset Orange
          600: '#E96B55', // Coral
          700: '#D94F50', // Deep Sunset Red
          800: '#B94A61', // Muted Rose
          900: '#7E2C3D',
        },
        dark: {
          bg: '#171717',
          surface: '#222222',
          surfaceHover: '#2A2A2A',
          border: '#333333',
          muted: '#858585',
        },
        cream: {
          DEFAULT: '#FFF7F0',
          50: '#FFFDFB',
          100: '#FFF7F0',
          200: '#FAECE1',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'sunset': '0 4px 20px -2px rgba(242, 140, 82, 0.15)',
        'sunset-lg': '0 10px 25px -3px rgba(233, 107, 85, 0.2)',
      }
    },
  },
  plugins: [],
}
