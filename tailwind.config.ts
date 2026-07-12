import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          850: "rgb(var(--ink-850) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          300: "rgb(var(--ink-300) / <alpha-value>)",
          100: "rgb(var(--ink-100) / <alpha-value>)"
        },
        rice: "rgb(var(--rice) / <alpha-value>)",
        scallion: "rgb(var(--scallion) / <alpha-value>)",
        chili: "rgb(var(--chili) / <alpha-value>)",
        soy: "rgb(var(--soy) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 18px 60px rgb(var(--shadow-color) / 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
