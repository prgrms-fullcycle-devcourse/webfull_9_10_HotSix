import { CircleX, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SideBar from "@/components/common/Sidebar/SideBar";
import { GameProgress } from "@/components/game/GameProgress";
import { RaceTrack } from "@/components/game/RaceTrack";
import TypingGame from "@/components/game/TypingGame/TypingGame";
import { BATTLE_SOCKET_EVENTS } from "@/lib/socket/socketEvents";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import { useSocketStore } from "@/stores/useSocketStore";

type GameResult = "playing" | "gameOver" | "winner";

type GamePageProps = {
  onHoldGameView: () => void;
  onMoveToSpectate: () => void;
};

const resultCopy = {
  gameOver: {
    Icon: CircleX,
    label: "RESULT",
    title: "탈락",
    description: "잠시 후 관전 화면으로 이동합니다",
    accentClassName: "text-point-red",
    panelClassName: "bg-point-red/15",
  },
  winner: {
    Icon: Trophy,
    label: "WINNER",
    title: "우승",
    description: "대기방으로 이동합니다",
    accentClassName: "text-point-yellow",
    panelClassName: "bg-point-yellow/20",
  },
} satisfies Record<
  Exclude<GameResult, "playing">,
  {
    Icon: typeof CircleX;
    label: string;
    title: string;
    description: string;
    accentClassName: string;
    panelClassName: string;
  }
>;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
};

const getPromptLength = (prompt: string) => {
  return prompt.replaceAll("\n", "").length;
};

const ResultModal = ({ result }: { result: Exclude<GameResult, "playing"> }) => {
  const { Icon, accentClassName, description, label, panelClassName, title } = resultCopy[result];

  return (
    <div className="bg-app flex h-dvh w-full items-center justify-center px-5 py-8">
      <section className="w-full max-w-[520px] border-4 border-black bg-surface-main shadow-[10px_10px_0_#000]">
        <div className="h-4 border-b-4 border-black bg-dash-red-white" />

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="border-4 border-black bg-surface-sub px-3 py-1 text-xs font-bold text-text/70 shadow-[4px_4px_0_#000]">
              {label}
            </span>
            <Icon className={accentClassName} aria-hidden="true" size={34} strokeWidth={3} />
          </div>

          <div
            className={`border-4 border-black px-5 py-7 text-center shadow-[inset_-4px_-4px_0_rgba(255,255,255,0.45),inset_4px_4px_0_rgba(0,0,0,0.12)] ${panelClassName}`}
          >
            <h1 className={`text-5xl font-bold ${accentClassName}`}>{title}</h1>
            <p className="mt-4 text-sm font-semibold text-text/70">{description}</p>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-bold text-text/50">
            <div className="h-1 bg-black/20" />
            <span>KEYBOARD WARRIOR</span>
            <div className="h-1 bg-black/20" />
          </div>
        </div>
      </section>
    </div>
  );
};

const GamePage = ({ onHoldGameView, onMoveToSpectate }: GamePageProps) => {
  const socket = useSocketStore((state) => state.socket);

  const prompt = useGameStore((state) => state.prompt);
  const participants = useGameStore((state) => state.participants);
  const gameId = useGameStore((state) => state.gameId);

  const [gameResult, setGameResult] = useState<GameResult>("playing");
  const gameResultRef = useRef<GameResult>("playing");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [localTypingCount, setLocalTypingCount] = useState(0);
  const [localAccuracy, setLocalAccuracy] = useState(0);
  const [localProgress, setLocalProgress] = useState(0);

  const [completedText, setCompletedText] = useState("");

  const myUserId = useAuthStore((s) => s.user?.id);
  const myParticipant = participants.find((p) => p.participantId === myUserId);

  const progress = Math.min(100, Math.max(0, myParticipant?.progressPercent ?? localProgress));

  const typingCount = myParticipant?.acceptedLength ?? localTypingCount;

  const accuracy = Math.min(
    100,
    Math.max(0, typingCount === 0 ? 0 : (myParticipant?.accuracy ?? localAccuracy)),
  );

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

    const moveToSpectate = () => {
      window.setTimeout(() => {
        onMoveToSpectate();
      }, 1500);
    };

    const handleEliminated = (data: { participantId: string }) => {
      if (data.participantId !== myParticipant.participantId) return;
      if (gameResultRef.current !== "playing") return;

      gameResultRef.current = "gameOver";
      onHoldGameView();
      setGameResult("gameOver");

      window.setTimeout(() => {
        onMoveToSpectate();
      }, 1500);
    };

    const handleFinished = (data?: { winnerParticipantId?: string | null }) => {
      if (gameResultRef.current !== "playing") return;

      const winnerParticipantId = data?.winnerParticipantId;

      const isWinner = winnerParticipantId
        ? winnerParticipantId === myParticipant.participantId
        : myParticipant.life > 0 &&
          myParticipant.status !== "eliminated" &&
          myParticipant.progressPercent >= 100;

      gameResultRef.current = isWinner ? "winner" : "gameOver";
      onHoldGameView();
      setGameResult(isWinner ? "winner" : "gameOver");

      moveToSpectate();
    };

    socket.on(BATTLE_SOCKET_EVENTS.ELIMINATED, handleEliminated);
    socket.on(BATTLE_SOCKET_EVENTS.FINISHED, handleFinished);

    return () => {
      socket.off(BATTLE_SOCKET_EVENTS.ELIMINATED, handleEliminated);
      socket.off(BATTLE_SOCKET_EVENTS.FINISHED, handleFinished);
    };
  }, [socket, myParticipant, onHoldGameView, onMoveToSpectate]);

  const handleInputChange = (
    inputText: string,
    correctCount = inputText.length,
    completedTypingCount = 0,
    completedCorrectCount = 0,
  ) => {
    if (!gameId) {
      console.warn("[battle:input skipped] gameId가 없습니다.");
      return;
    }

    const accumulatedText = completedText + inputText;

    console.log("[battle:input payload]", {
      raw: inputText,
      json: JSON.stringify(inputText),
      length: inputText.length,
      lastChar: inputText.at(-1),
      charCode: inputText.at(-1)?.charCodeAt(0),
    });
    socket?.emit(BATTLE_SOCKET_EVENTS.INPUT, {
      gameId,
      typedText: accumulatedText,
      cursorPosition: inputText.length,
    });

    const totalLength = getPromptLength(prompt);
    const totalTypingCount = completedTypingCount + inputText.length;
    const totalCorrectCount = completedCorrectCount + correctCount;

    const nextAccuracy =
      totalTypingCount === 0 ? 0 : Math.floor((totalCorrectCount / totalTypingCount) * 100);

    const nextProgress =
      totalLength === 0 ? 0 : Math.min(Math.floor((totalCorrectCount / totalLength) * 100), 100);

    setLocalTypingCount(totalTypingCount);
    setLocalAccuracy(nextAccuracy);
    setLocalProgress(nextProgress);
  };

  const handleWrongInput = () => {
    // 서버에서 life를 관리하므로 여기서는 별도 처리하지 않음
  };
  const handleLineComplete = (completeLine: string) => {
    setCompletedText((prev) => prev + completeLine);
  };

  if (gameResult === "gameOver") {
    return <ResultModal result="gameOver" />;
  }

  if (gameResult === "winner") {
    return <ResultModal result="winner" />;
  }

  return (
    <div className="relative flex h-dvh w-full overflow-hidden">
      <div className="h-full w-full">
        <div className="flex h-full w-full gap-3 overflow-hidden">
          <div className="w-[260px] shrink-0">
            <SideBar mode="game" />
          </div>

          <div className="flex pr-8 min-w-0 flex-1 justify-center overflow-hidden">
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
                  onLineComplete={handleLineComplete}
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
