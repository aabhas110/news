import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"]
      },
      colors: {
        ink: "#101418",
        paper: "#f7f5ef",
        line: "#ded8cc",
        accent: "#0f766e",
        signal: "#c2410c"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(16, 20, 24, 0.08)"
      }
    }
  },
  plugins: [typography]
};

export default config;
