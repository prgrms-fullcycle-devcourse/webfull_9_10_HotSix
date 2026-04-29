type HeartStatusProps = {
  life: number;
  maxLife?: number;
};

const HeartStatus = ({ life, maxLife = 3 }: HeartStatusProps) => {
  return (
    <div className="flex gap-3 text-2xl">
      {Array.from({ length: maxLife }, (_, index) => {
        const heartKey = `heart-${life}-${index}`;

        return <span key={heartKey}>{index < life ? "❤️" : "🖤"}</span>;
      })}
    </div>
  );
};

export default HeartStatus;
