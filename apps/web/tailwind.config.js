/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [require('@repo/tokens/tailwind-preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
