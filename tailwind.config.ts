import type { Config } from "tailwindcss";

const config: Config = {
  // Enable class-based dark mode so our ThemeProvider's `html.dark` toggle works.
  darkMode: ["class", ".dark"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;

