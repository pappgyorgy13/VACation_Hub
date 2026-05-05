/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cs2-orange': '#f97316',
        'cs2-dark': '#0a0a0a',
        'cs2-gray': '#1a1a1a',
        'cs2-light': '#2a2a2a',
        'vac-red': '#dc2626',
        'troll-purple': '#9333ea',
      },
    },
  },
  plugins: [],
}