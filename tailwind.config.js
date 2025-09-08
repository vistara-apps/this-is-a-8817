/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 94%, 49%)',
        accent: 'hsl(13, 95%, 55%)',
        bg: 'hsl(214, 32%, 92%)',
        surface: 'hsl(210, 40%, 98%)',
        'text-primary': 'hsl(210, 12%, 15%)',
        'text-secondary': 'hsl(210, 12%, 35%)',
        border: 'hsl(210, 40%, 85%)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(210, 12%, 10%, 0.08)',
      },
    },
  },
  plugins: [],
}