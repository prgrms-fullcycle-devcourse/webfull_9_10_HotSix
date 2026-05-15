import heartFull from "@/assets/icons/heart.svg";
import heartEmpty from "@/assets/icons/heart-depleted.svg";

type HeartStatusProps = {
  life: number;
  maxLife?: number;
};

const HeartStatus = ({ life, maxLife = 3 }: HeartStatusProps) => {
  return (
    <div className="flex gap-3 text-2xl">
      {Array.from({ length: maxLife }, (_, index) => {
        const heartKey = `heart-${life}-${index}`;

        return (
          <span key={heartKey}>
            {index < life ? (
              <img src={heartFull} alt="heartFull" className="w-7 h-7" />
            ) : (
              <img src={heartEmpty} alt="heartEmpty" className="w-7 h-7" />
            )}
          </span>
        );
      })}
    </div>
  );
};

export default HeartStatus;
