type RaceTrackProps = {
  progress: number;
};

export default function RaceTrack({ progress }: RaceTrackProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <section className="relative h-[87px] w-full max-w-[900px] overflow-visible">
      {/* 도로 */}
      <div className="absolute left-[8%] right-[5.5%] top-1/2 h-[54px] -translate-y-1/2 bg-[#333333]">
        {/* 위 빨간 라인 */}
        <div className="absolute inset-x-0 top-0 h-[8px] bg-[repeating-linear-gradient(to_right,#ff6b6b_0px,#ff6b6b_18px,white_18px,white_36px)]" />

        {/* 아래 빨간 라인 */}
        <div className="absolute inset-x-0 bottom-0 h-[8px] bg-[repeating-linear-gradient(to_right,#ff6b6b_0px,#ff6b6b_18px,white_18px,white_36px)]" />

        {/* 중앙 점선 */}
        <div className="absolute inset-x-0 top-1/2 h-[7px] -translate-y-1/2 bg-[repeating-linear-gradient(to_right,white_0px,white_22px,transparent_22px,transparent_44px)]" />
      </div>

      {/* 자동차 */}
      <img
        src="/car-blue.png"
        alt="player car"
        className="absolute top-1/2 z-20 h-[clamp(44px,8vw,72px)] w-auto -translate-y-1/2 transition-all duration-300"
        style={{
          left: `calc(8% + (${safeProgress} / 100) * 80%)`,
        }}
      />

      {/* 골 라인 */}
      <div className="absolute right-[1.5%] top-1/2 z-10 flex h-[62px] -translate-y-1/2 items-center bg-white px-1">
        <div className="mr-1 flex h-full w-[18px] flex-col">
          <div className="h-1/2 bg-black" />
          <div className="h-1/2 bg-[#333333]" />
        </div>

        <span className="text-[13px] font-bold leading-[13px] text-yellow-400 [writing-mode:vertical-rl]">
          GOAL
        </span>
      </div>
    </section>
  );
}
