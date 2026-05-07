import type { ThemeMode } from "@/stores/useThemeStore";

type Props = {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
};

export default function ThemeToggle({ mode, onChange }: Props) {
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={() => onChange(isDark ? "light" : "dark")}
      className={`relative flex h-6 w-11 items-center rounded-full border-2 border-border px-1 transition-colors ${
        isDark ? "bg-[#111111]" : "bg-surface-sub"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full border border-1 border-border bg-point-yellow shadow-[2px_2px_0_0_var(--color-shadow)] transition-transform ${
          isDark ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
