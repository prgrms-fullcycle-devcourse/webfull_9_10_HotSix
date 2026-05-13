import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SideBar from "@/components/common/Sidebar/SideBar";
import { GameProgress } from "@/components/game/GameProgress";
import { RaceTrack } from "@/components/game/RaceTrack";
import TypingGame from "@/components/game/TypingGame/TypingGame";
import { PATH } from "@/constants/route";
import { useGameData } from "@/hooks/useGame";
import { BATTLE_SOCKET_EVENTS } from "@/lib/socket/socketEvents";
import { useGameStore } from "@/stores/useGameStore";
import { useSocketStore } from "@/stores/useSocketStore";

type GameResult = "playing" | "gameOver" | "winner";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
};

const getPromptLength = (prompt: string) => {
  return prompt.replaceAll("\n", "").length;
};

const GamePage = () => {
  useGameData();

  const navigate = useNavigate();
  const socket = useSocketStore((state) => state.socket);

  const prompt = useGameStore((state) => state.prompt);
  const participants = useGameStore((state) => state.participants);

  const [gameResult, setGameResult] = useState<GameResult>("playing");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [localTypingCount, setLocalTypingCount] = useState(0);
  const [localAccuracy, setLocalAccuracy] = useState(100);
  const [localProgress, setLocalProgress] = useState(0);

  const myParticipant = participants[0];

  const progress = myParticipant?.progressPercent ?? localProgress;
  const typingCount = myParticipant?.typedLength ?? localTypingCount;
  const accuracy = myParticipant?.accuracy ?? localAccuracy;
  const life = myParticipant?.life ?? 3;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!socket || !myParticipant?.participantId) return;

    const moveToGameLobby = () => {
      window.setTimeout(() => {
        navigate(PATH.GAME_LOBBY);
      }, 1500);
    };

    const handleEliminated = (data: { participantId: string }) => {
      if (data.participantId !== myParticipant.participantId) return;

      setGameResult("gameOver");

      window.setTimeout(() => {
        navigate(PATH.SPECTATE);
      }, 1500);
    };

    const handleFinished = (data?: { winnerParticipantId?: string }) => {
      const winnerParticipantId = data?.winnerParticipantId;

      const isWinner = winnerParticipantId
        ? winnerParticipantId === myParticipant.participantId
        : myParticipant.progressPercent >= 100;

      setGameResult(isWinner ? "winner" : "gameOver");

      moveToGameLobby();
    };

    socket.on(BATTLE_SOCKET_EVENTS.ELIMINATED, handleEliminated);
    socket.on(BATTLE_SOCKET_EVENTS.FINISHED, handleFinished);

    return () => {
      socket.off(BATTLE_SOCKET_EVENTS.ELIMINATED, handleEliminated);
      socket.off(BATTLE_SOCKET_EVENTS.FINISHED, handleFinished);
    };
  }, [socket, myParticipant, navigate]);

  const handleInputChange = (
    inputText: string,
    correctCount = inputText.length,
    completedTypingCount = 0,
    completedCorrectCount = 0,
  ) => {
    socket?.emit(BATTLE_SOCKET_EVENTS.INPUT, {
      inputText,
      cursorPosition: inputText.length,
      typedChars: completedTypingCount + inputText.length,
    });

    const totalLength = getPromptLength(prompt);
    const totalTypingCount = completedTypingCount + inputText.length;
    const totalCorrectCount = completedCorrectCount + correctCount;

    const nextAccuracy =
      totalTypingCount === 0 ? 100 : Math.floor((totalCorrectCount / totalTypingCount) * 100);

    const nextProgress =
      totalLength === 0 ? 0 : Math.min(Math.floor((totalCorrectCount / totalLength) * 100), 100);

    setLocalTypingCount(totalTypingCount);
    setLocalAccuracy(nextAccuracy);
    setLocalProgress(nextProgress);
  };

  const handleWrongInput = () => {
    // 서버에서 life를 관리하므로 여기서는 별도 처리하지 않음
  };

  if (gameResult === "gameOver") {
    return (
      <div className="bg-surface-main flex h-dvh w-full items-center justify-center">
        <div className="rounded-2xl bg-white px-16 py-12 text-center shadow-lg">
          <h1 className="text-4xl font-bold text-red-500">Game Over</h1>
          <p className="mt-4 text-lg text-gray-500">잠시 후 이동합니다...</p>
        </div>
      </div>
    );
  }

  if (gameResult === "winner") {
    return (
      <div className="bg-surface-main flex h-dvh w-full items-center justify-center">
        <div className="rounded-2xl bg-white px-16 py-12 text-center shadow-lg">
          <h1 className="text-4xl font-bold text-state-active">Victory!</h1>
          <p className="mt-4 text-lg text-gray-500">대기방으로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-main relative flex h-dvh w-full overflow-hidden">
      <Link
        to={PATH.SETTING}
        aria-label="설정 페이지로 이동"
        className="absolute right-[72px] top-[30px] z-50 flex h-[47px] w-[47px] items-center justify-center"
      >
        <Settings size={47} strokeWidth={2.5} className="text-text" />
      </Link>

      <div className="h-full w-full p-6">
        <div className="flex h-full w-full gap-8 overflow-hidden">
          <div className="w-[260px] shrink-0">
            <SideBar mode="game" />
          </div>

          <div className="flex min-w-0 flex-1 justify-center overflow-hidden">
            <div className="w-full max-w-[1180px]">
              <div className="flex w-full flex-col items-center gap-6">
                <RaceTrack progress={progress} carIndex={0} />

                <GameProgress
                  typingCount={typingCount}
                  accuracy={accuracy}
                  time={formatTime(elapsedSeconds)}
                />

                <TypingGame
                  prompt={prompt}
                  life={life}
                  onInputChange={handleInputChange}
                  onWrongInput={handleWrongInput}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
