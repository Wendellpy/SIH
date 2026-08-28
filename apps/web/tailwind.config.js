/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0d14',
        surface: {
          50: '#141a24',
          100: '#1a2230',
          200: '#222d3f',
          300: '#2d3b52',
          400: '#3c4e6b',
        },
        brand: {
          primary: '#0ea5e9',   // Cyan/Sky
          emerald: '#10b981',   // Cadastre Green
          amber: '#f59e0b',     // Warning/Alert
          danger: '#ef4444',    // Collision Conflict Red
          purple: '#8b5cf6',    // Metro / High Altitude
        },
        utility: {
          water: '#06b6d4',
          sewer: '#f97316',
          power: '#eab308',
          telecom: '#ec4899',
          gas: '#14b8a6',
          metro: '#a855f7'
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-cyan': '0 0 15px rgba(14, 165, 233, 0.5)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.6)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};
