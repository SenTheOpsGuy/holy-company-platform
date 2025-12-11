import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'temple-brown': '#5D4037',
        'sacred-gold': '#D4AF37',
        'cream': '#FFF8E1',
        'deep-brown': '#3E2723',
        'auspicious-saffron': '#FF6F00',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'crimson': ['Crimson Text', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'confetti': 'confetti 3s ease-out forwards',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 10px #D4AF37, 0 0 20px #D4AF37, 0 0 30px #D4AF37' },
          'to': { boxShadow: '0 0 20px #D4AF37, 0 0 30px #D4AF37, 0 0 40px #D4AF37' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(1000px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
