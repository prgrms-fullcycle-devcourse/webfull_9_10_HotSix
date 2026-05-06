import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function PixelButton({ children, onClick, type = "button" }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="font-pixel border-4 border-black px-10 py-3 text-xl shadow-[8px_8px_0_0_rgb(0,0,0)] enabled:active:translate-x-1 enabled:active:translate-y-1 enabled:active:shadow-[4px_4px_0_0_rgb(0,0,0)] disabled:cursor-not-allowed disabled:opacity-50 bg-[#3a3a3a] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {children}
    </button>
  );
}
