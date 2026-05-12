import heart from "@/assets/icons/heart.svg";

interface HeartIconsProps {
  life: number;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-6 h-6",
};

const HeartIcons = ({ life, size = "sm" }: HeartIconsProps) => {
  const hearts = Array.from({ length: life }, (_, i) => ({
    id: i, // key용
  }));

  return (
    <div className="flex gap-0.5 shrink-0">
      {hearts.map((h) => (
        <span key={h.id}>
          <img src={heart} alt="heart" className={sizeMap[size]} />
        </span>
      ))}
    </div>
  );
};

export default HeartIcons;
