import char1 from "@/assets/icons/char1.svg";

type ProgressBarProps = {
  progress: number;
};

const ProgressBar = ({ progress }: ProgressBarProps) => {
  return (
    <>
      {/* 차량 아이콘 */}
      <div className="relative h-3 mb-4 z-10">
        <div
          className="absolute top-0.5 transition-[all] duration-500"
          style={{ left: `calc(${progress}% - 15px)` }}
        >
          <span>
            <img src={char1} alt="car" className="w-[32px]" />
          </span>
        </div>
      </div>

      {/* 진행바 */}
      <div className="relative h-1.5 bg-black/30  z-0">
        <div
          className="absolute inset-y-0 left-0 bg-state-active transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
};

export default ProgressBar;
