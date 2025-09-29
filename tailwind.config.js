/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-blue-50', 'bg-red-50', 'bg-green-50', 'bg-purple-50', 'bg-yellow-50',
    'text-blue-600', 'text-red-600', 'text-green-600', 'text-purple-600', 'text-yellow-600',
    'border-blue-500', 'border-red-500', 'border-green-500', 'border-purple-500', 'border-yellow-500'
  ]
}