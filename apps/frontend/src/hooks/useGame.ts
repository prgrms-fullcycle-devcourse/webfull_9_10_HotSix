import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getGameDetail, getScoreBoard } from "@/api/game.api";
import { useGameStore } from "@/stores/useGameStore";

export const useGameDetail = () => {
  return useQuery({
    queryKey: ["gameDetail"],
    queryFn: getGameDetail,
    retry: false,
  });
};

export const useScoreboard = () => {
  return useQuery({
    queryKey: ["scoreboard"],
    queryFn: getScoreBoard,
    retry: false,
  });
};

// 참가자 컴포넌트용
export const useGameData = () => {
  const { data: game } = useGameDetail();
  const { data: scoreboard } = useScoreboard();

  const { setParticipants, setPrompt } = useGameStore();

  console.log(game);

  useEffect(() => {
    // 👉 1. 실제 데이터 있을 때
    if (game && scoreboard && game.participants?.length > 0) {
      setPrompt(game.prompt.text);

      const mapped = game.participants.map((p) => {
        const score = scoreboard.find((s) => s.userId === p.userId);

        return {
          participantId: p.userId,
          nickname: p.nickname,
          typedLength: p.typedLength,
          progressPercent: p.progressPercent,
          wpm: score?.wpm ?? p.wpm,
          life: score?.life ?? 3,
          rank: score?.rank ?? 0,
          accuracy: score?.accuracy ?? p.accuracy,
        };
      });

      setParticipants(mapped);
      return;
    }

    // 👉 2. mock 데이터 fallback
    const mockParticipants = [
      {
        participantId: "1",
        nickname: "플레이어1",
        typedLength: 120,
        progressPercent: 30,
        wpm: 250,
        life: 3,
        rank: 1,
        accuracy: 98,
      },
      {
        participantId: "2",
        nickname: "플레이어2",
        typedLength: 90,
        progressPercent: 22,
        wpm: 210,
        life: 2,
        rank: 2,
        accuracy: 95,
      },
    ];

    const mockPrompt = "이것은 테스트용 문장입니다.";

    setPrompt(mockPrompt);
    setParticipants(mockParticipants);
  }, [game, scoreboard, setParticipants, setPrompt]);
};
