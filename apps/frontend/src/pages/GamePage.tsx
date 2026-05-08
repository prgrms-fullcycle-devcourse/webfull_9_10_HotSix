import { Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Socket } from "socket.io-client";

import { GameProgress } from "@/components/game/GameProgress";
import PracticeBox from "@/components/game/PracticeBox";
import { RaceTrack } from "@/components/game/RaceTrack";
import SideBar from "@/components/game/Sidebar/SideBar";
import TypingGame from "@/components/game/TypingGame/TypingGame";
import { PATH } from "@/constants/route";
import { createBattleSocket } from "@/lib/socket/battleSocket";
import { BATTLE_SOCKET_EVENTS } from "@/lib/socket/socketEvents";

const MOCK_PROMPT = `동해물과 백두산이 마르고 닳도록
하느님이 보우하사 우리 나라 만세
무궁화 삼천리 화려강산
대한사람 대한으로 길이 보전하세`;

type GamePhase = "waiting" | "countdown" | "playing";

const getPromptLength = (prompt: string) => {
  return prompt.replaceAll("\n", "").length;
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
};

const formatWaitingTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}분 ${remainSeconds}초`;
  }

  return `${remainSeconds}초`;
};

const GamePage = () => {
  const socketRef = useRef<Socket | null>(null);

  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [waitingSeconds, setWaitingSeconds] = useState(15);
  const [countdown, setCountdown] = useState(10);

  const [promptContent, setPromptContent] = useState(MOCK_PROMPT);
  const [progress, setProgress] = useState(0);
  const [typingCount, setTypingCount] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [life, setLife] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (phase !== "playing") return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "waiting") return;

    const timer = window.setInterval(() => {
      setWaitingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setPhase("countdown");

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "countdown") return;

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setPhase("playing");
          setElapsedSeconds(0);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [phase]);

  useEffect(() => {
    const socketAuthToken = "ws_tk_xxx";

    const socket = createBattleSocket(socketAuthToken);
    socketRef.current = socket;

    socket.on(BATTLE_SOCKET_EVENTS.WELCOME, (data) => {
      console.log("소켓 연결 성공:", data);
    });

    socket.on(BATTLE_SOCKET_EVENTS.ERROR, (error) => {
      console.error("소켓 에러:", error);
    });

    socket.on(BATTLE_SOCKET_EVENTS.STATE, (data) => {
      console.log("현재 게임 상태:", data);
    });

    socket.on(BATTLE_SOCKET_EVENTS.WAITING, (data) => {
      console.log("게임 대기 중:", data);
    });

    socket.on(BATTLE_SOCKET_EVENTS.STARTED, (data) => {
      console.log("게임 시작:", data);

      setPromptContent(data.prompt.content);
      setElapsedSeconds(0);
      setTypingCount(0);
      setAccuracy(100);
      setProgress(0);
      setLife(3);
      setPhase("playing");
    });

    socket.on(BATTLE_SOCKET_EVENTS.PROGRESS, (data) => {
      console.log("진행 상황:", data);

      setProgress(data.participant.progressPercent);
      setTypingCount(data.participant.acceptedLength);
      setAccuracy(data.participant.accuracy);
      setLife(data.participant.life);
    });

    socket.on(BATTLE_SOCKET_EVENTS.ELIMINATED, (data) => {
      console.log("탈락:", data);
      setLife(0);
    });

    socket.on(BATTLE_SOCKET_EVENTS.FINISHED, (data) => {
      console.log("게임 종료:", data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleInputChange = (
    inputText: string,
    correctCount = inputText.length,
    completedTypingCount = 0,
    completedCorrectCount = 0,
  ) => {
    socketRef.current?.emit(BATTLE_SOCKET_EVENTS.INPUT, {
      inputText,
      cursorPosition: inputText.length,
      typedChars: completedTypingCount + inputText.length,
    });

    const totalLength = getPromptLength(promptContent);
    const totalTypingCount = completedTypingCount + inputText.length;
    const totalCorrectCount = completedCorrectCount + correctCount;

    const nextAccuracy =
      totalTypingCount === 0 ? 100 : Math.floor((totalCorrectCount / totalTypingCount) * 100);

    const nextProgress =
      totalLength === 0 ? 0 : Math.min(Math.floor((totalCorrectCount / totalLength) * 100), 100);

    setTypingCount(totalTypingCount);
    setAccuracy(nextAccuracy);
    setProgress(nextProgress);
  };

  const handleWrongInput = () => {
    setLife((prev) => Math.max(prev - 1, 0));
  };

  const isPlaying = phase === "playing";

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-[#5D6F79]">
      <Link
        to={PATH.SETTING}
        aria-label="설정 페이지로 이동"
        className="absolute right-[72px] top-[30px] z-50 flex h-[47px] w-[47px] items-center justify-center"
      >
        <Settings size={47} strokeWidth={2.5} className="text-[#3F3F3F]" />
      </Link>

      <div className="flex h-full w-full gap-8 px-8 py-6">
        <div className="w-[260px] shrink-0">
          <SideBar mode={isPlaying ? "game" : "waiting"} />
        </div>

        <div className="flex min-w-0 flex-1 justify-center overflow-hidden">
          <div className="w-full max-w-[1180px]">
            <div className="flex w-full flex-col items-center gap-6">
              {isPlaying ? (
                <RaceTrack progress={progress} />
              ) : (
                <div className="flex h-[87px] w-full max-w-[900px] items-center justify-center text-center text-[clamp(28px,3vw,44px)] font-bold text-white drop-shadow-[3px_3px_0px_#000]">
                  {phase === "waiting" ? "게임 진입까지 " : "게임 시작까지 "}

                  <span className="text-yellow-400">
                    {phase === "waiting" ? formatWaitingTime(waitingSeconds) : `${countdown}초`}
                  </span>
                </div>
              )}

              <GameProgress
                typingCount={typingCount}
                accuracy={accuracy}
                time={isPlaying ? formatTime(elapsedSeconds) : "01:14"}
                isWaiting={!isPlaying}
              />

              {phase === "waiting" && <PracticeBox />}

              {phase === "countdown" && (
                <div className="flex h-[clamp(300px,52vh,420px)] w-full max-w-[916px] items-center justify-center border-[4px] border-black bg-[#454545] shadow-[8px_8px_0px_#000]">
                  <span className="text-[clamp(80px,12vw,140px)] font-bold text-white drop-shadow-[4px_4px_0px_#000]">
                    {countdown}
                  </span>
                </div>
              )}

              {phase === "playing" && (
                <TypingGame
                  prompt={promptContent}
                  life={life}
                  onInputChange={handleInputChange}
                  onWrongInput={handleWrongInput}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
