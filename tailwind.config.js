/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#F7F5F0',
          desk: '#EFECE6',
          dark: '#E5E0D8',
          card: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          light: '#3F3C37',
          muted: '#766F64',
          faint: '#9E978C',
          border: '#DED8CE',
          rule: '#E8E4DC',
        },
        taupe: {
          DEFAULT: '#8C7E6B',
          light: '#B8ADA0',
          subtle: '#E8E4DC',
        },
        fakt: {
          50: '#F0F4F8',
          100: '#D9E3EE',
          200: '#B3C8DD',
          500: '#2C4A6E', // Muted Swedish naval blue
          600: '#233B58',
          700: '#1B2E45',
          800: '#142233',
          900: '#0C1622',
        },
        stamp: {
          DEFAULT: '#C53B27',
          faint: '#FDF2F0',
        },
        swish: {
          DEFAULT: '#E20613',
          dark: '#B0000C',
        }
      },
      boxShadow: {
        'sheet': '0 1px 3px rgba(0,0,0,0.03), 0 10px 30px -5px rgba(28,26,23,0.07)',
        'sheet-lifted': '0 3px 8px rgba(0,0,0,0.05), 0 20px 40px -10px rgba(28,26,23,0.12)',
        'desk-inset': 'inset 0 1px 2px rgba(0,0,0,0.04)',
        'stamp': '0 2px 0 #1B2E45',
      }
    },
  },
  plugins: [],
}
