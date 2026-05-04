export type GameProgressProps = {
  typingCount: number;
  accuracy: number;
  time: string;
};

export type StatusItemProps = {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
};
