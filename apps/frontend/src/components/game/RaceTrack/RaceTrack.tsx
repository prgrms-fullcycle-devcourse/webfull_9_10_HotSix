type RaceTrackProps = {
  progress: number;
};

export default function RaceTrack({ progress }: RaceTrackProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  // 트랙 계산값 (피그마 기준)
  const TRACK_START = 72; // left-[72px]
  const TRACK_END = 48; // right-[48px]
  const TRACK_WIDTH = 843 - TRACK_START - TRACK_END; // 실제 도로 길이

  return (
    <section className="relative h-[87px] w-full max-w-[900px] overflow-visible">
      {/* 도로 */}
      <div className="absolute left-[72px] right-[48px] top-1/2 h-[54px] -translate-y-1/2 bg-[#333333]">
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
        className="absolute top-1/2 z-20 h-[72px] w-auto -translate-y-1/2 transition-all duration-300"
        style={{
          left: `calc(${TRACK_START}px + (${safeProgress} / 100) * ${TRACK_WIDTH}px)`,
        }}
      />

      {/* 골 라인 */}
      <div className="absolute right-[12px] top-1/2 z-10 flex h-[62px] -translate-y-1/2 items-center bg-white px-1">
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
