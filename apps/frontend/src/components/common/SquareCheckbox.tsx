type Props = {
  label: string;
  checked: boolean;
  onClick: () => void;
};

export function SquareSizeCheckbox({ label, checked, onClick }: Props) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 text-sm">
      <span
        className={`flex h-4 w-4 items-center justify-center border-2 border-border bg-surface-sub ${
          checked ? "before:block before:h-2 before:w-2 before:bg-point-yellow" : ""
        }`}
      />
      <span className={checked ? "text-text" : "text-text/60"}>{label}</span>
    </button>
  );
}
