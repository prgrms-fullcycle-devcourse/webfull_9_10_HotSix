import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinMatch } from "@/api/match.api";
import settingIcon from "@/assets/icons/settingIcon.svg";
import BgImage from "@/assets/images/racing_night.svg";
import PixelButton from "@/components/common/PixelButton";
import SideBar from "@/components/common/Sidebar/SideBar";
import ParticipantCard from "@/components/spectator/ParticipantCard";
import { PATH } from "@/constants/route";
import { useGameData, useGameDetail, useLatestGameResult } from "@/hooks/useGame";
import { createBattleSocket } from "@/lib/socket/battleSocket";
import { registerConnectionHandlers } from "@/lib/socket/handlers/connection.handler";
import { registerGameHandlers } from "@/lib/socket/handlers/game.handler";
import { useGameStore } from "@/stores/useGameStore";
import { useSocketStore } from "@/stores/useSocketStore";

const SpectatePage = () => {
  const navigate = useNavigate();

  useGameData();

  const participants = useGameStore((s) => s.participants);
  const prompt = useGameStore((s) => s.prompt);
  const phase = useGameStore((s) => s.phase);
  const socket = useSocketStore((s) => s.socket);
  const [isJoiningNextGame, setIsJoiningNextGame] = useState(false);
  const hasJoinedNextGameRef = useRef(false);
  const shouldShowResult = phase === "finished";
  const { data: latestResult, isLoading: isResultLoading } = useLatestGameResult(shouldShowResult);
  const { data: polledGame } = useGameDetail({
    enabled: isJoiningNextGame,
    refetchInterval: isJoiningNextGame ? 1000 : false,
  });

  const rankings = latestResult?.rankings ?? [];

  useEffect(() => {
    if (!isJoiningNextGame || hasJoinedNextGameRef.current) return;
    if (polledGame?.game.phase !== "waiting") return;

    hasJoinedNextGameRef.current = true;

    const joinNextGame = async () => {
      socket?.disconnect();
      useSocketStore.getState().disconnect();
      useGameStore.getState().resetForWaiting();

      const { socketAuthToken } = await joinMatch();
      const nextSocket = createBattleSocket(socketAuthToken);

      useSocketStore.getState().connect(nextSocket);
      registerConnectionHandlers(nextSocket);
      registerGameHandlers(nextSocket);

      navigate(PATH.GAME_LOBBY);
    };

    void joinNextGame();
  }, [isJoiningNextGame, navigate, polledGame?.game.phase, socket]);

  const handleJoinNextGame = () => {
    setIsJoiningNextGame(true);
  };

  return (
    <div
      className="relative flex h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${BgImage})` }}
    >
      <SideBar mode="spectate" />

      {/* 참가자 카드 영역 */}
      <div className="relative flex-1 overflow-hidden px-10 pt-6 pb-6">
        <div
          className="
            h-full
            overflow-y-auto
            overflow-x-hidden
            pr-5
            pb-8

            [&::-webkit-scrollbar]:w-4
            [&::-webkit-scrollbar-track]:bg-[#2f2f2f]
            [&::-webkit-scrollbar-track]:border-[3px]
            [&::-webkit-scrollbar-track]:border-black

            [&::-webkit-scrollbar-thumb]:bg-white
            [&::-webkit-scrollbar-thumb]:border-[3px]
            [&::-webkit-scrollbar-thumb]:border-black
            [&::-webkit-scrollbar-thumb]:rounded-none

            hover:[&::-webkit-scrollbar-thumb]:bg-[#ffd83d]
          "
        >
          <div
            className="
              grid
              grid-cols-3
              gap-x-8
              gap-y-10
              items-start
              justify-items-center
            "
          >
            {participants.map((p) => (
              <ParticipantCard
                key={p.participantId}
                nickname={p.nickname}
                progress={p.progressPercent ?? 0}
                acceptedLength={p.acceptedLength ?? 0}
                wpm={p.wpm ?? 0}
                promptText={prompt ?? ""}
                life={p.life ?? 3}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 설정 */}
      <button
        type="button"
        onClick={() => navigate(PATH.SETTING)}
        className="absolute right-5 top-5 h-10 w-10 flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px]"
      >
        <img src={settingIcon} alt="설정" />
      </button>

      {shouldShowResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <section className="w-full max-w-[560px] border-4 border-black bg-surface-main px-6 py-6 shadow-[10px_10px_0_#000]">
            <h2 className="mb-5 text-center text-3xl font-bold text-text">게임이 끝났습니다</h2>

            <div className="mb-5 border-4 border-black bg-surface-sub px-4 py-4">
              {isResultLoading ? (
                <p className="text-center text-sm text-text/70">결과를 불러오는 중...</p>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-text/70">우승자</span>
                    <span className="font-bold text-point-yellow">
                      {latestResult?.winner || "-"}
                    </span>
                  </div>

                  <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                    {rankings.map((ranking, index) => (
                      <div
                        key={`${ranking.game_id}-${ranking.user_id}`}
                        className="grid grid-cols-[40px_1fr_64px_64px] items-center gap-2 border-2 border-black bg-surface-main px-3 py-2 text-xs"
                      >
                        <span className="font-bold text-point-yellow">
                          {ranking.final_rank ?? index + 1}
                        </span>
                        <span className="truncate font-bold text-text">
                          {ranking.users?.nickname ?? "플레이어"}
                        </span>
                        <span className="text-right text-text/70">WPM {ranking.wpm ?? 0}</span>
                        <span className="text-right text-text/70">{ranking.accuracy ?? 0}%</span>
                      </div>
                    ))}

                    {!isResultLoading && rankings.length === 0 && (
                      <p className="text-center text-sm text-text/70">표시할 결과가 없습니다.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center">
              <PixelButton type="button" disabled={isJoiningNextGame} onClick={handleJoinNextGame}>
                {isJoiningNextGame ? "다음 게임 준비 중..." : "다음 게임 참여하기"}
              </PixelButton>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default SpectatePage;
