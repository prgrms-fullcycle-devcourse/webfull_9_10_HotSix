import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import type { PageMode } from "@/types";
import type { Player } from "@/types/game/player";
import HeartIcons from "../../HeartIcons";
import ProgressBar from "../../ProgressBar";

interface UserListPanelProps {
  mode: PageMode;
  players?: Player[];
  waiting?: Player[];
}

const PlayerCard = ({ player }: { player: Player }) => {
  const isDead = player.life === 0;

  return (
    <div
      className={`border-4 border-black bg-surface-sub px-3 py-1.5 shadow-[2px_2px_0_rgba(128,128,128,0.25),0_4px_4px_rgba(0,0,0,0.25)]
        ${isDead ? "opacity-40 grayscale" : ""}
      `}
    >
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

const WaitingCard = ({ player, isMe }: { player: Player; isMe?: boolean }) => (
  <div
    className={`border-4 border-black bg-surface-sub px-3 py-3 shadow-[2px_2px_0_rgba(128,128,128,0.25),0_4px_4px_rgba(0,0,0,0.25)]
      ${isMe ? "border-point-mint" : ""}
    `}
  >
    <div className="flex justify-between items-center">
      <span
        className={`text-xs truncate max-w-[65%] ${
          isMe ? "font-extrabold text-point-mint" : "font-bold text-text"
        }`}
      >
        {player.nickname}
      </span>

      <span className={`text-[10px] font-medium ${isMe ? "text-point-mint" : "text-text/50"}`}>
        대기 중
      </span>
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
      className="relative flex-1 w-[95px] h-[36px] cursor-pointer transition-all z-0"
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
  const participants = useGameStore((state) => state.participants);

  const currentUserId = useAuthStore((state) => {
    const authState = state as unknown as {
      user?: { id?: string };
      userId?: string;
      me?: { id?: string };
    };

    return authState.user?.id ?? authState.userId ?? authState.me?.id;
  });

  const currentUserNickname = useAuthStore((state) => {
    const authState = state as unknown as {
      user?: { nickname?: string };
      nickname?: string;
      me?: { nickname?: string };
    };

    return authState.user?.nickname ?? authState.nickname ?? authState.me?.nickname ?? "나";
  });

  const storePlayers: Player[] = useMemo(() => {
    const mappedPlayers = participants.map((participant) => ({
      id: participant.participantId,
      nickname: participant.nickname || "플레이어",
      progress: participant.progressPercent ?? 0,
      life: participant.life ?? 3,
    }));

    if (mappedPlayers.length > 0) {
      return mappedPlayers;
    }

    if (!currentUserId) {
      return [];
    }

    return [
      {
        id: currentUserId,
        nickname: currentUserNickname,
        progress: 0,
        life: 3,
      },
    ];
  }, [participants, currentUserId, currentUserNickname]);

  const displayPlayers = players ?? storePlayers;
  const displayWaiting = waiting ?? (mode === "game" ? [] : storePlayers);

  type TabType = "players" | "waiting";

  const [currentTab, setCurrentTab] = useState<TabType>(
    mode === "game" || mode === "watch" ? "players" : "waiting",
  );

  const isWatchMode = mode === "watch";
  const isWaitingMode = mode === "waiting";

  return (
    <section className="relative w-[220px] pt-[35px]">
      <div className="absolute top-0 left-0 flex items-end gap-1">
        {mode === "game" && (
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
        )}

        {isWatchMode && (
          <TabItem
            active={currentTab === "players"}
            label="참가자"
            count={displayPlayers.length}
            onClick={() => setCurrentTab("players")}
          />
        )}

        {isWaitingMode && (
          <TabItem
            active={currentTab === "waiting"}
            label="대기자"
            count={displayWaiting.length}
            onClick={() => setCurrentTab("waiting")}
          />
        )}
      </div>

      <div className="relative z-20 w-full bg-surface-main shadow-[7px_7px_0_#000] flex flex-col">
        <div className="p-3">
          <div className="bg-surface-sub border-4 border-black p-2 min-h-[380px] overflow-y-auto space-y-2">
            {currentTab === "players"
              ? displayPlayers.map((p) => <PlayerCard key={p.id} player={p} />)
              : displayWaiting.map((p) => (
                  <WaitingCard
                    key={p.id}
                    player={p}
                    isMe={p.id === currentUserId || displayWaiting.length === 1}
                  />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserListPanel;
