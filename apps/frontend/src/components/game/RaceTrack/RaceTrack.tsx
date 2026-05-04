type RaceTrackProps = {
  progress: number; // 0 ~ 100
};

export default function RaceTrack({ progress }: RaceTrackProps) {
  return (
    <div className="relative w-full max-w-[843px] h-[87px] border-4 border-blue-400 bg-white overflow-hidden">
      {/* 도로 */}
      <div className="absolute top-1/2 left-0 w-full h-[40px] -translate-y-1/2 bg-[#333] flex items-center">
        {/* 중앙 점선 */}
        <div className="w-full h-[4px] bg-[repeating-linear-gradient(to_right,white_0px,white_20px,transparent_20px,transparent_40px)]" />
      </div>

      {/* 자동차 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
        style={{
          left: `${progress}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        🚗
      </div>

      {/* 골 라인 */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center text-xs font-bold text-yellow-500">
        <div className="w-2 h-2 bg-black mb-1" />
        <span>GOAL</span>
      </div>
    </div>
  );
}
