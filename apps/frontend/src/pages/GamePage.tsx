import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SideBar from "@/components/common/Sidebar/SideBar";
import { GameProgress } from "@/components/game/GameProgress";
import { RaceTrack } from "@/components/game/RaceTrack";
import TypingGame from "@/components/game/TypingGame/TypingGame";
import { PATH } from "@/constants/route";
import { useGameData } from "@/hooks/useGame";
import { BATTLE_SOCKET_EVENTS } from "@/lib/socket/socketEvents";
import { useGameStore } from "@/stores/useGameStore";
import { useSocketStore } from "@/stores/useSocketStore";

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

  const socket = useSocketStore((state) => state.socket);

  const prompt = useGameStore((state) => state.prompt);
  const participants = useGameStore((state) => state.participants);

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
