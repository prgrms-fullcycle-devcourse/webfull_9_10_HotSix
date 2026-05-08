import { useState } from "react";
import type { PageMode } from "@/types";
import type { Player } from "@/types/game/player";
import HeartIcons from "../../HeartIcons";
import ProgressBar from "../../ProgressBar";

interface UserListPanelProps {
  mode: PageMode;
  players?: Player[]; // 참가자 (game 모드)
  waiting?: Player[]; // 대기자 (공통)
}

const DUMMY_PLAYERS: Player[] = [
  { id: "1", nickname: "닉네임 1", progress: 72, life: 3 },
  { id: "2", nickname: "닉네임 2", progress: 45, life: 2 },
  { id: "3", nickname: "닉네임 3", progress: 20, life: 0 },
];

const DUMMY_WAITING: Player[] = [
  { id: "4", nickname: "닉네임 4", progress: 0, life: 3 },
  { id: "5", nickname: "닉네임 5", progress: 0, life: 3 },
  { id: "6", nickname: "닉네임 6", progress: 0, life: 3 },
  { id: "7", nickname: "닉네임 7", progress: 0, life: 3 },
];

const PlayerCard = ({ player }: { player: Player }) => {
  const isDead = player.life === 0;

  return (
    <div
      className={`border-4 border-black bg-surface-sub px-3 py-1.5 shadow-[2px_2px_0_rgba(128,128,128,0.25),0_4px_4px_rgba(0,0,0,0.25)]
            ${isDead ? "opacity-40 grayscale" : ""}
            `}
    >
      {/* 닉네임 + 하트 */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-text truncate max-w-[65%]">
          {player.nickname}
        </span>
        <HeartIcons life={player.life} size="sm" />
      </div>

      <ProgressBar progress={player.progress} />
    </div>
  );
};

const WaitingCard = ({ player }: { player: Player }) => (
  <div className="border-4 border-black bg-surface-sub px-3 py-3 shadow-[2px_2px_0_rgba(128,128,128,0.25),0_4px_4px_rgba(0,0,0,0.25)]">
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-text truncate max-w-[65%]">{player.nickname}</span>
      <span className="text-[10px] text-text/50 font-medium">대기 중</span>
    </div>
  </div>
);

const TabItem = ({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      className={`relative flex-1 w-[95px] h-[36px] cursor-pointer transition-all z-0`}
      onClick={onClick}
      style={{
        filter: "drop-shadow(7px 4px 0 black)",
      }}
    >
      <div
        className={`w-full h-full flex items-center justify-center text-caption font-normal transition-colors
                        ${active ? "bg-surface-main" : "bg-surface-sub"}`}
        style={{
          clipPath: "polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)",
        }}
      >
        {label} ({count})
      </div>
    </button>
  );
};

const UserListPanel = ({ mode, players, waiting }: UserListPanelProps) => {
  const displayPlayers = players ?? DUMMY_PLAYERS;
  const displayWaiting = waiting ?? DUMMY_WAITING;

  // ── game 모드: 참가자 | 대기자
  // ── lobby / watch 모드: 대기자 | 채팅

  type TabType = "players" | "waiting";
  const [currentTab, setCurrentTab] = useState<TabType>(mode === "game" ? "players" : "waiting");

  return (
    <section className="relative w-[220px] pt-[35px]">
      <div className="absolute top-0 left-0 flex items-end gap-1">
        {/* 게임 모드 */}
        {mode === "game" ? (
          <>
            <TabItem
              active={currentTab === "players"}
              label="참가자"
              count={displayPlayers.length}
              onClick={() => setCurrentTab("players")}
            />

            <TabItem
              active={currentTab === "waiting"}
              label="대기자"
              count={displayWaiting.length}
              onClick={() => setCurrentTab("waiting")}
            />
          </>
        ) : (
          <>
            {/* 대기 / 관전 모드 */}
            <TabItem
              active={currentTab === "waiting"}
              label="대기자"
              count={displayWaiting.length}
              onClick={() => setCurrentTab("waiting")}
            />
          </>
        )}
      </div>

      <div className="relative z-20 w-full bg-surface-main shadow-[7px_7px_0_#000] flex flex-col">
        <div className="p-3">
          <div className="bg-surface-sub border-4 border-black p-2 min-h-[380px] overflow-y-auto space-y-2">
            {currentTab === "players"
              ? displayPlayers.map((p) => <PlayerCard key={p.id} player={p} />)
              : displayWaiting.map((p) => <WaitingCard key={p.id} player={p} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserListPanel;
