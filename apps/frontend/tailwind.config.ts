import type { Config } from "tailwindcss";

export default {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{ts,tsx,css}"],
  theme: {
    extend: {
      colors: {
        // 배경
        app: "var(--color-app)",

        // 텍스트
        text: "var(--color-text)",

        // 박스
        surface: {
          main: "var(--color-surface-main)",
          sub: "var(--color-surface-sub)",
        },

        // 포인트
        point: {
          yellow: "#F4D03F",
          red: "#E05C5C",
          mint: "#5BC8AF",
        },

        // 활성화 상태
        state: {
          active: "#4ADE80",
        },
      },

      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
        pixel: ["neodgm", "monospace"],
      },

      fontSize: {
        // UI
        caption: "14px",
        body: "16px",
        "title-sm": "20px",
        "title-md": "24px",
        "title-lg": "30px",

        // 타이핑 게임
        "typing-sm": "16px",
        "typing-base": "20px",
        "typing-lg": "24px",
      },
    },
  },
  plugins: [],
} satisfies Config;
