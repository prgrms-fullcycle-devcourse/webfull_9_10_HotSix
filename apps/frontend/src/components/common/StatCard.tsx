type Props = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: Props) {
  return (
    <div className="border-4 border-border bg-surface-sub px-6 py-4 text-center text-caption shadow-[6px_6px_0_0_var(--color-shadow)]">
      <div className="mb-2 text-point-yellow">{label}</div>
      <div className="text-body">{value}</div>
    </div>
  );
}
