import aspectRatio from '@tailwindcss/aspect-ratio';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 6s linear infinite',
        'float': 'float 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      colors: {
        primary: {
          50: '#fef2f2',   // Rojo muy claro
          100: '#fee2e2',  // Rojo claro
          200: '#fecaca',  // Rojo suave
          300: '#fca5a5',  // Rojo medio claro
          400: '#f87171',  // Rojo medio
          500: '#dc2626',  // Rojo principal
          600: '#b91c1c',  // Rojo fuerte
          700: '#991b1b',  // Rojo oscuro
          800: '#7f1d1d',  // Rojo muy oscuro
          900: '#450a0a',  // Rojo casi negro
        },
        gray: {
          50: '#ffffff',   // Blanco puro
          100: '#f9fafb',  // Blanco grisáceo
          200: '#f3f4f6',  // Gris muy claro
          300: '#e5e7eb',  // Gris claro
          400: '#9ca3af',  // Gris medio
          500: '#6b7280',  // Gris
          600: '#4b5563',  // Gris oscuro
          700: '#374151',  // Gris muy oscuro
          800: '#1f2937',  // Negro grisáceo
          900: '#111827',  // Negro principal
          950: '#000000',  // Negro puro
        },
        secondary: {
          50: '#fafafa',   // Blanco grisáceo
          100: '#f5f5f5',  // Gris muy claro
          200: '#e5e5e5',  // Gris claro
          300: '#d4d4d4',  // Gris medio claro
          400: '#a3a3a3',  // Gris medio
          500: '#737373',  // Gris
          600: '#525252',  // Gris oscuro
          700: '#404040',  // Gris muy oscuro
          800: '#262626',  // Negro grisáceo
          900: '#171717',  // Negro
          950: '#0a0a0a',  // Negro muy oscuro
        },
      },
    },
  },
  plugins: [
    aspectRatio, // necesario para aspect-w-1 aspect-h-1
  ],
}
