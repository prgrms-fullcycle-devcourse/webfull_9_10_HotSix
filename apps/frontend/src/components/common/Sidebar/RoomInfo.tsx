import { useGameStore } from "@/stores/useGameStore";

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
  mode: "game" | "watch" | "waiting";
  stats?: RoomStats | GameStats;
}

const RoomInfo = ({ mode, stats }: RoomInfoProps) => {
  const participants = useGameStore((state) => state.participants);
  const waitingPlayerCount = useGameStore((state) => state.waitingPlayerCount);

  const playerCount = Math.max(waitingPlayerCount, participants.length);

  const aliveCount = participants.filter((p) => p.life > 0).length;
  const deadCount = participants.filter((p) => p.life <= 0).length;

  const displayStats =
    stats ??
    (mode === "watch"
      ? {
          alive: aliveCount,
          dead: deadCount,
          waiting: playerCount,
        }
      : {
          waiting: playerCount,
          language: "한국어",
        });

  return (
    <section className="w-[220px] flex-shrink-0 border-4 border-black bg-surface-main px-3 py-3 shadow-[8px_8px_0_#000] ">
      <h3 className="text-sm font-semibold text-text mb-3">방 정보</h3>

      <div className="h-[7rem] flex flex-col justify-center border-4 border-black bg-surface-sub px-4 py-4 space-y-2 shadow-[inset_-4px_-4px_0_rgba(255,255,255,0.5),inset_4px_4px_0_rgba(0,0,0,0.1)]">
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

        {["game", "waiting"].includes(mode) && (
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
