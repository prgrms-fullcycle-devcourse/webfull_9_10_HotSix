import type { HTMLAttributes, ReactNode } from "react";

type Props = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export default function ShadowBox({ children, className = "", ...divProps }: Props) {
  return (
    <div
      {...divProps}
      className={`font-pixel border-4 border-border px-10 py-3 text-xl shadow-[8px_8px_0_0_var(--color-shadow)] enabled:active:translate-x-1 enabled:active:translate-y-1 enabled:active:shadow-[4px_4px_0_0_var(--color-shadow)] disabled:cursor-not-allowed disabled:opacity-50 bg-surface-main text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text ${className}`}
    >
      {children}
    </div>
  );
}
