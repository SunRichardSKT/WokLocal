import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08090b",
          900: "#0f1115",
          850: "#151820",
          800: "#1d212b",
          700: "#2a303c",
          500: "#697181",
          300: "#b7bfcc",
          100: "#eef1f5"
        },
        rice: "#f5efe0",
        scallion: "#8ecf9e",
        chili: "#ff7a5f",
        soy: "#b99063"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
