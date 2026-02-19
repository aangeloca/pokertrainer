import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pokerGreen: "#0f5c3f",
        pokerDark: "#0b1f1a",
        xpYellow: "#ffcc00"
      }
    }
  },
  plugins: []
};

export default config;
