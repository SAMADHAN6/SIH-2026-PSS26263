import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aicte: {
          navy: "#0F2C61",
          deep: "#091B3D",
          light: "#1A448A",
          saffron: "#F59E0B",
          saffronDark: "#D97706",
          gold: "#EAB308",
          tricolorOrange: "#FF9933",
          tricolorGreen: "#138808",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Segoe UI", "sans-serif"],
        heading: ["var(--font-merriweather)", "Georgia", "serif"],
      },
      boxShadow: {
        gov: "0 2px 8px -1px rgba(15, 44, 97, 0.08), 0 1px 4px -1px rgba(15, 44, 97, 0.04)",
        govCard: "0 4px 20px -2px rgba(15, 44, 97, 0.1)",
        govHover: "0 10px 25px -3px rgba(15, 44, 97, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
