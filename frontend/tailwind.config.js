/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: 'rgb(26, 44, 78)', // El color azul marino de tus imágenes
          foreground: '#ffffff',
          primary: '#2563eb',
          accent: 'rgba(255, 255, 255, 0.1)',
          'accent-foreground': '#ffffff',
          border: 'rgba(255, 255, 255, 0.1)',
          ring: '#2563eb',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // Útil para las transiciones del Sidebar
}