import { Settings } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Socket } from "socket.io-client";
import SideBar from "@/components/common/Sidebar/SideBar";
import { GameProgress } from "@/components/game/GameProgress";
import PracticeBox from "@/components/game/PracticeBox";
import { RaceTrack } from "@/components/game/RaceTrack";
import TypingGame from "@/components/game/TypingGame/TypingGame";
import { PATH } from "@/constants/route";
import { createBattleSocket } from "@/lib/socket/battleSocket";
import { BATTLE_SOCKET_EVENTS } from "@/lib/socket/socketEvents";

const REFRESH_TOKEN_COOKIE_ERROR_MESSAGE = "게스트 로그인에 실패했습니다.";
const MATCH_JOIN_ERROR_MESSAGE = "매치 참가에 실패했습니다.";
const MIN_PLAYERS = 4;
const MOCK_PROMPT = `동해물과 백두산이 마르고 닳도록
하느님이 보우하사 우리 나라 만세
무궁화 삼천리 화려강산
대한사람 대한으로 길이 보전하세`;

type GamePhase = "waiting" | "countdown" | "playing";

type JoinMatchResponse = {
  socketAuthToken?: string;
  data?: {
    socketAuthToken?: string;
  };
};

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

const getDurationSeconds = (startedAt?: string, endedAt?: string) => {
  if (!startedAt || !endedAt) return 0;

  const durationMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();

  return Math.max(0, Math.floor(durationMs / 1000));
};

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL;
};

const GamePage = () => {
  const socketRef = useRef<Socket | null>(null);
  const isEnoughPlayersRef = useRef(false);

  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [waitingSeconds, setWaitingSeconds] = useState(0);
  const [countdown, setCountdown] = useState(10);

  const [previousWinner, setPreviousWinner] = useState("-");
  const [waitingPlayerCount, setWaitingPlayerCount] = useState(0);
  const [previousGameDuration, setPreviousGameDuration] = useState("00:00");

  const [promptContent, setPromptContent] = useState(MOCK_PROMPT);
  const [progress, setProgress] = useState(0);
  const [typingCount, setTypingCount] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [life, setLife] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const updatePlayerStatus = useCallback((playerCount: number, minPlayers: number) => {
    const hasEnoughPlayers = playerCount >= minPlayers;

    isEnoughPlayersRef.current = hasEnoughPlayers;
    setWaitingPlayerCount(playerCount);

    return hasEnoughPlayers;
  }, []);

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
    if (phase !== "countdown") return;

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);

          if (!isEnoughPlayersRef.current) {
            setPhase("waiting");
            setCountdown(10);
            setWaitingSeconds(0);

            return prev;
          }

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
    const connectBattleSocket = async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();

        const loginResponse = await fetch(`${apiBaseUrl}/v1/auth/guest/login`, {
          method: "POST",
          credentials: "include",
        });

        if (!loginResponse.ok) {
          throw new Error(REFRESH_TOKEN_COOKIE_ERROR_MESSAGE);
        }

        const loginData = await loginResponse.json();

        const accessToken =
          loginData.tokens?.accessToken ??
          loginData.data?.tokens?.accessToken ??
          loginData.accessToken;

        if (!accessToken) {
          throw new Error("accessToken이 없습니다.");
        }

        const joinResponse = await fetch(`${apiBaseUrl}/v1/match/join`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!joinResponse.ok) {
          throw new Error(MATCH_JOIN_ERROR_MESSAGE);
        }

        const joinData = (await joinResponse.json()) as JoinMatchResponse;
        const socketAuthToken = joinData.socketAuthToken ?? joinData.data?.socketAuthToken;

        if (!socketAuthToken) {
          throw new Error("socketAuthToken이 없습니다.");
        }

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

          const playerCount = data.game?.playerCount ?? data.playerCount ?? 0;
          const minPlayers = data.game?.minPlayers ?? data.minPlayers ?? MIN_PLAYERS;

          updatePlayerStatus(playerCount, minPlayers);

          const winner =
            data.previousGame?.winner?.nickname ??
            data.previousGame?.winnerName ??
            data.previousGame?.winner ??
            "-";

          setPreviousWinner(winner);

          const startedAt =
            data.previousGame?.gameStartedAt ??
            data.previousGame?.startedAt ??
            data.game?.gameStartedAt;

          const endedAt =
            data.previousGame?.gameEndedAt ?? data.previousGame?.endedAt ?? data.game?.gameEndedAt;

          setPreviousGameDuration(formatTime(getDurationSeconds(startedAt, endedAt)));
        });

        socket.on(BATTLE_SOCKET_EVENTS.WAITING, (data) => {
          console.log("게임 대기 중:", data);

          const playerCount = data.game?.playerCount ?? data.playerCount ?? 0;
          const minPlayers = data.game?.minPlayers ?? data.minPlayers ?? MIN_PLAYERS;
          const hasEnoughPlayers = updatePlayerStatus(playerCount, minPlayers);

          if (!hasEnoughPlayers) {
            setPhase("waiting");
            setWaitingSeconds(0);
            setCountdown(10);
            return;
          }

          const remainingSeconds = data.remainingSeconds ?? 15;

          setWaitingSeconds(remainingSeconds);

          if (remainingSeconds <= 10) {
            setPhase("countdown");
            setCountdown(remainingSeconds);
            return;
          }

          setPhase("waiting");
        });

        socket.on(BATTLE_SOCKET_EVENTS.STARTED, (data) => {
          console.log("게임 시작:", data);

          if (!isEnoughPlayersRef.current) {
            console.warn("최소 인원 미달로 STARTED 이벤트 무시");
            setPhase("waiting");
            setWaitingSeconds(0);
            setCountdown(10);
            return;
          }

          setPromptContent(data.prompt?.content ?? MOCK_PROMPT);
          setElapsedSeconds(0);
          setTypingCount(0);
          setAccuracy(100);
          setProgress(0);
          setLife(3);
          setPhase("playing");
        });

        socket.on(BATTLE_SOCKET_EVENTS.PROGRESS, (data) => {
          console.log("진행 상황:", data);

          setProgress(data.participant?.progressPercent ?? 0);
          setTypingCount(data.participant?.acceptedLength ?? 0);
          setAccuracy(data.participant?.accuracy ?? 100);
          setLife(data.participant?.life ?? 3);
        });

        socket.on(BATTLE_SOCKET_EVENTS.ELIMINATED, (data) => {
          console.log("탈락:", data);
          setLife(0);
        });

        socket.on(BATTLE_SOCKET_EVENTS.FINISHED, (data) => {
          console.log("게임 종료:", data);
        });
      } catch (error) {
        console.error("소켓 연결 준비 실패:", error);
      }
    };

    connectBattleSocket();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [updatePlayerStatus]);

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
            <SideBar mode={isPlaying ? "game" : "waiting"} />
          </div>

          <div className="flex min-w-0 flex-1 justify-center overflow-hidden">
            <div className="w-full max-w-[1180px]">
              <div className="flex w-full flex-col items-center gap-6">
                {isPlaying ? (
                  <RaceTrack progress={progress} carIndex={0} />
                ) : (
                  <div className="flex h-[87px] w-full max-w-[900px] items-center justify-center text-center text-[clamp(28px,3vw,44px)] font-bold text-text drop-shadow-[3px_3px_0px_#000]">
                    {waitingPlayerCount < MIN_PLAYERS ? (
                      <span className="text-yellow-400">참여자를 기다리는 중...</span>
                    ) : (
                      <>
                        {phase === "waiting" ? "게임 진입까지 " : "게임 시작까지 "}
                        <span className="text-yellow-400">
                          {phase === "waiting"
                            ? formatWaitingTime(waitingSeconds)
                            : `${countdown}초`}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <GameProgress
                  typingCount={isPlaying ? typingCount : waitingPlayerCount}
                  accuracy={isPlaying ? accuracy : previousWinner}
                  time={isPlaying ? formatTime(elapsedSeconds) : previousGameDuration}
                  isWaiting={!isPlaying}
                />

                {phase === "waiting" && <PracticeBox />}

                {phase === "countdown" && (
                  <div className="flex h-[clamp(300px,52vh,420px)] w-full max-w-[916px] items-center justify-center border-[4px] border-black bg-surface-sub shadow-[8px_8px_0px_#000]">
                    <span className="text-[clamp(80px,12vw,140px)] font-bold text-text drop-shadow-[4px_4px_0px_#000]">
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
    </div>
  );
};

export default GamePage;
