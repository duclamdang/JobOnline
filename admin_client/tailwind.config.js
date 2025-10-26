/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#451da0",   // tím đậm
        secondary: "#2ca2ff", // xanh dương
        success: "#16A34A",   // xanh lá
        warning: "#F59E0B",   // vàng
        danger: "#DC2626",    // đỏ
        grayCustom: "#6B7280"
      },
      fontFamily: {
        sans: ["Lexend", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ['Alata', 'sans-serif'],
        varela: ['Varela Round', 'sans-serif']
      },
    },
  },
  plugins: [],
};
