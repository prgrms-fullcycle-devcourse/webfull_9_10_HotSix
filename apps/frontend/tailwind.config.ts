import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        ember: "#ff6b35",
        sand: "#fff7e8",
      },
    },
  },
  plugins: [],
} satisfies Config;
