import { useGameStore } from "@/stores/useGameStore";
import type { PageMode } from "@/types";

interface GameStats {
  alive: number;
  dead: number;
  participants: number;
  spectators: number;
}

interface RoomStats {
  waiting: number;
  language: string;
}

interface RoomInfoProps {
  mode: PageMode;
  stats?: RoomStats | GameStats;
}

const RoomInfo = ({ mode }: RoomInfoProps) => {
  const participants = useGameStore((state) => state.participants);
  const waitingPlayers = useGameStore((state) => state.waitingPlayers);
  const waitingPlayerCount = useGameStore((state) => state.waitingPlayerCount);
  const spectatorCount = useGameStore((state) => state.spectatorCount);

  const aliveCount = participants.filter((p) => p.life > 0).length;
  const deadCount = participants.filter((p) => p.life <= 0).length;
  const waitingCount = Math.max(waitingPlayers.length, waitingPlayerCount);

  const displayStats =
    mode === "spectate" || mode === "game"
      ? {
          alive: aliveCount,
          dead: deadCount,
          participants: participants.length,
          spectators: spectatorCount,
        }
      : {
          waiting: waitingCount,
          language: "한국어",
        };

  return (
    <section className="w-[220px] flex-shrink-0 border-4 border-black bg-surface-main px-3 py-3 shadow-[8px_8px_0_#000] ">
      <h3 className="text-sm font-semibold text-text mb-3">방 정보</h3>

      <div className="min-h-[7rem] flex flex-col justify-center border-4 border-black bg-surface-sub px-4 py-4 space-y-2 shadow-[inset_-4px_-4px_0_rgba(255,255,255,0.5),inset_4px_4px_0_rgba(0,0,0,0.1)]">
        {["game", "spectate"].includes(mode) && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">참가자</span>
              <span className="text-sm font-normal text-point-mint">
                {(displayStats as GameStats).participants}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">생존자</span>
              <span className="text-sm font-normal text-point-mint">
                {(displayStats as GameStats).alive}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">사망자</span>
              <span className="text-sm font-normal text-point-red">
                {(displayStats as GameStats).dead}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">관전자</span>
              <span className="text-sm font-normal text-point-yellow">
                {(displayStats as GameStats).spectators}
              </span>
            </div>
          </>
        )}

        {mode === "waiting" && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">대기자</span>
              <span className="text-sm font-normal text-point-yellow">
                {(displayStats as RoomStats).waiting}
              </span>
            </div>

            <div />

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text/70">언어</span>
              <span className="text-sm font-normal text-text">
                {(displayStats as RoomStats).language}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RoomInfo;
