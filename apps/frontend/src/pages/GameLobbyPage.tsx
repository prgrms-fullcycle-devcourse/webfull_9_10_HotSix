import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import settingIcon from "@/assets/icons/settingIcon.svg";
import SideBar from "@/components/common/Sidebar/SideBar";
import { GameProgress } from "@/components/game/GameProgress";
import PracticeBox from "@/components/game/PracticeBox";
import { PATH } from "@/constants/route";
import { useGameData } from "@/hooks/useGame";
import { useGameStore } from "@/stores/useGameStore";

const GameLobbyPage = () => {
  const navigate = useNavigate();

  useGameData();

  const phase = useGameStore((state) => state.phase);
  const participants = useGameStore((state) => state.participants);
  const waitingPlayerCount = useGameStore((state) => state.waitingPlayerCount);
  const countdown = useGameStore((state) => state.countdown);
  const previousWinner = useGameStore((state) => state.previousWinner);
  const previousGameDuration = useGameStore((state) => state.previousGameDuration);

  const playerCount = Math.max(waitingPlayerCount, participants.length);

  useEffect(() => {
    if (phase === "in_progress") {
      navigate(PATH.GAME);
    }

    if (phase === "finished") {
      navigate(PATH.SPECTATE);
    }
  }, [phase, navigate]);

  const MIN_PLAYERS = 4;
  const isCountdown = phase === "waiting" && playerCount >= MIN_PLAYERS;

  return (
    <div className="bg-surface-main relative flex h-dvh w-full overflow-hidden">
      <button
        type="button"
        onClick={() => navigate(PATH.SETTING)}
        className="absolute right-[72px] top-[30px] z-50 flex h-[47px] w-[47px] items-center justify-center"
        aria-label="설정"
      >
        <img src={settingIcon} alt="설정" />
      </button>

      <div className="h-full w-full p-6">
        <div className="flex h-full w-full gap-8 overflow-hidden">
          <div className="w-[260px] shrink-0">
            <SideBar mode="waiting" />
          </div>

          <div className="flex min-w-0 flex-1 justify-center overflow-hidden">
            <div className="w-full max-w-[1180px]">
              <div className="flex w-full flex-col items-center gap-6">
                <div className="flex h-[87px] w-full max-w-[900px] items-center justify-center text-center text-[clamp(28px,3vw,44px)] font-bold text-text drop-shadow-[3px_3px_0px_#000]">
                  {isCountdown ? (
                    <>
                      게임 시작까지 <span className="text-yellow-400">{countdown}초</span>
                    </>
                  ) : (
                    <span className="text-yellow-400">참여자를 기다리는 중...</span>
                  )}
                </div>

                <GameProgress
                  typingCount={playerCount}
                  accuracy={previousWinner}
                  time={previousGameDuration}
                  isWaiting
                />

                <div className="relative w-full max-w-[916px]">
                  <PracticeBox />

                  {isCountdown && countdown <= 10 && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center border-[4px] border-black bg-black/60">
                      <span className="text-[clamp(80px,12vw,140px)] font-bold text-yellow-400 drop-shadow-[4px_4px_0px_#000]">
                        {countdown}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobbyPage;
