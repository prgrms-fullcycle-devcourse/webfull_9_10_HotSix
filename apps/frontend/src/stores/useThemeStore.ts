import { create } from "zustand";
import { TYPING_FONT_SIZE_CLASS } from "@/constants/typingFontSize";
import type { ThemeMode, TypingFontSize } from "../types/setting/setting.types";

export type { ThemeMode };

const THEME_STORAGE_KEY = "theme-mode";
const FONT_SIZE_STORAGE_KEY = "typing-font-size";

function getInitialFontSize(): TypingFontSize {
  if (typeof window === "undefined") return "medium";
  const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
  if (saved === "small" || saved === "medium" || saved === "large") return saved;
  return "medium";
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyThemeClass(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
}

const initialTheme = getInitialTheme();
applyThemeClass(initialTheme);

type ThemeState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  typingFontSize: TypingFontSize;
  setTypingFontSize: (size: TypingFontSize) => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    applyThemeClass(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === "dark" ? "light" : "dark";
    get().setTheme(nextTheme);
  },
  typingFontSize: getInitialFontSize(),
  setTypingFontSize: (size) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    }
    set({ typingFontSize: size });
  },
}));

export const useTypingFontSizeClass = () => {
  const size = useThemeStore((state) => state.typingFontSize);
  return TYPING_FONT_SIZE_CLASS[size];
};
