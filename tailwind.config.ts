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
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        tadika: {
          sunflower: '#f59e0b',
          sky: '#0284c7',
          coral: '#f43f5e',
          mint: '#10b981',
          lavender: '#8b5cf6',
          cream: '#fffbeb',
        }
      },
    },
  },
  plugins: [],
};
export default config;

