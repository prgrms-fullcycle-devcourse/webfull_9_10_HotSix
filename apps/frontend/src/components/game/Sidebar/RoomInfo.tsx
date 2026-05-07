import { useState } from "react";

interface RoomStats {
  alive: number;
  dead: number;
  waiting: number;
}

interface GameStats {
  waiting: number;
  language: string;
}

interface RoomInfoProps {
  mode: "game" | "lobby" | "watch";
  stats?: RoomStats | GameStats; // ← stats를 props로 받기
}

// 더미 데이터 (기본값)
const DUMMY_WATCH_STATS: RoomStats = {
  alive: 3,
  dead: 5,
  waiting: 23,
};

const DUMMY_GAME_STATS: GameStats = {
  waiting: 23,
  language: "한국어",
};

const RoomInfo = ({ mode, stats }: RoomInfoProps) => {
  // props로 stats를 받으면 사용, 없으면 더미데이터 사용
  const [displayStats] = useState(() => {
    if (stats) return stats;
    return mode === "watch" ? DUMMY_WATCH_STATS : DUMMY_GAME_STATS;
  });

  return (
    <section className="w-[220px] flex-shrink-0 border-4 border-black bg-surface-main px-3 py-3 shadow-[8px_8px_0_#000] ">
      <h3 className="text-sm font-semibold text-text mb-3">방 정보</h3>

      <div className="h-[7rem] flex flex-col justify-center border-4 border-black bg-surface-sub px-4 py-4 space-y-2 shadow-[inset_-4px_-4px_0_rgba(255,255,255,0.5),inset_4px_4px_0_rgba(0,0,0,0.1)]">
        {/* 관전방: 생존자/사망자/대기자 */}
        {mode === "watch" && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">생존자</span>
              <span className="text-sm font-normal text-point-mint">
                {(displayStats as RoomStats).alive}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">사망자</span>
              <span className="text-sm font-normal text-point-red">
                {(displayStats as RoomStats).dead}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">대기자</span>
              <span className="text-sm font-normal text-point-yellow">
                {(displayStats as RoomStats).waiting}
              </span>
            </div>
          </>
        )}

        {/* 게임/대기방: 대기자/언어 */}
        {["game", "lobby"].includes(mode) && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">대기자</span>
              <span className="text-sm font-normal text-point-yellow">
                {(displayStats as GameStats).waiting}
              </span>
            </div>
            <div />
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">언어</span>
              <span className="text-sm font-normal text-text">
                {(displayStats as GameStats).language}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RoomInfo;
