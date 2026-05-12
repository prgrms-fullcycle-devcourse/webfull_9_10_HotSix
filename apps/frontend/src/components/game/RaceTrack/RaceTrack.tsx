import char1 from "@/assets/icons/char1.svg";
import char2 from "@/assets/icons/char2.svg";
import char3 from "@/assets/icons/char3.svg";
import char4 from "@/assets/icons/char4.svg";
import char5 from "@/assets/icons/char5.svg";
import char6 from "@/assets/icons/char6.svg";
import char7 from "@/assets/icons/char7.svg";

const CAR_ICONS = [char1, char2, char3, char4, char5, char6, char7];

type RaceTrackProps = {
  progress: number;
  carIndex?: number;
};

export default function RaceTrack({ progress, carIndex = 0 }: RaceTrackProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  const selectedCar = CAR_ICONS[carIndex % CAR_ICONS.length];

  return (
    <section className="relative h-[87px] w-full max-w-[900px] overflow-visible">
      {/* 도로 */}
      <div className="absolute left-[8%] right-[5.5%] top-1/2 h-[54px] -translate-y-1/2 bg-surface-sub">
        {/* 위 빨간 라인 */}
        <div className="absolute inset-x-0 top-0 h-[8px] bg-[repeating-linear-gradient(to_right,#ff6b6b_0px,#ff6b6b_18px,white_18px,white_36px)]" />

        {/* 아래 빨간 라인 */}
        <div className="absolute inset-x-0 bottom-0 h-[8px] bg-[repeating-linear-gradient(to_right,#ff6b6b_0px,#ff6b6b_18px,white_18px,white_36px)]" />

        {/* 중앙 점선 */}
        <div className="absolute inset-x-0 top-1/2 h-[7px] -translate-y-1/2 bg-[repeating-linear-gradient(to_right,white_0px,white_22px,transparent_22px,transparent_44px)]" />
      </div>

      {/* 자동차 */}
      <img
        src={selectedCar}
        alt="player car"
        className="absolute top-1/2 z-20 h-[clamp(44px,8vw,72px)] w-auto -translate-y-1/2 transition-all duration-300"
        draggable={false}
        style={{
          left: `calc(8% + (${safeProgress} / 100) * 80%)`,
          imageRendering: "pixelated",
        }}
      />

      {/* 골 라인 */}
      <div className="absolute right-[1.5%] top-1/2 z-10 flex h-[62px] -translate-y-1/2 items-center bg-white px-1">
        <div className="mr-1 flex h-full w-[18px] flex-col">
          <div className="h-1/2 bg-black" />
          <div className="h-1/2 bg-surface-sub" />
        </div>

        <span className="text-[13px] font-bold leading-[13px] text-yellow-400 [writing-mode:vertical-rl]">
          GOAL
        </span>
      </div>
    </section>
  );
}
