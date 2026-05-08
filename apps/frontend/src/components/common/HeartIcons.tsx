import heart from "@/assets/icons/heart.svg";

interface HeartIconsProps {
  life: number;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "12px",
  md: "14px",
  lg: "20px",
};

const HeartIcons = ({ life, size = "sm" }: HeartIconsProps) => {
  const hearts = Array.from({ length: life }, (_, i) => ({
    id: i, // key용
  }));

  return (
    <div className="flex gap-1 shrink-0">
      {hearts.map((h) => (
        <span key={h.id}>
          <img src={heart} alt="heart" className={`w-[${sizeMap[size]}]`} />
        </span>
      ))}
    </div>
  );
};

export default HeartIcons;
