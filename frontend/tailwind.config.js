/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Nuansa Kopi Espresso & Warm Roast
        coffee: {
          50: '#FDFBF7',
          100: '#F7F0E4',
          200: '#EBDDC9',
          300: '#D8C3A5',
          400: '#BA9C76',
          500: '#9B7750',
          600: '#7E5A35',
          700: '#5F3E1E',
          800: '#412911',
          900: '#281708',
          950: '#170C03',
        },
        // Nuansa Deep Caramel & Warm Bronze Gold
        terracotta: {
          50: '#FEF9EE',
          100: '#FCF1D6',
          200: '#F7DEAA',
          300: '#F1C574',
          400: '#E8A73E',
          500: '#C7771E', // Rich Bronze Caramel
          600: '#A95E14',
          700: '#8A4810',
          800: '#6C360F',
          900: '#4E240C',
        },
        sage: {
          50: '#F4F8F4',
          100: '#E4EFE5',
          500: '#2E7D4C',
          600: '#24653D',
          700: '#1C4F2F',
        },
        warmbg: '#FAF5ED',
        warmcard: '#FFFFFF',
        warmborder: '#EBDDC9',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(65, 41, 17, 0.06), 0 1px 3px -1px rgba(65, 41, 17, 0.04)',
        'card': '0 6px 20px -4px rgba(65, 41, 17, 0.09), 0 2px 6px -2px rgba(65, 41, 17, 0.04)',
        'floating': '0 14px 36px -6px rgba(65, 41, 17, 0.16), 0 4px 12px -2px rgba(65, 41, 17, 0.08)',
      },
    },
  },
  plugins: [],
};
