import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getGameDetail, getScoreBoard } from "@/api/game.api";
import { type Participant, useGameStore } from "@/stores/useGameStore";

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

export const useGameData = () => {
  const { data: game } = useGameDetail();
  const { data: scoreboard } = useScoreboard();

  const { setParticipants, setPrompt, setWaitingState } = useGameStore();

  useEffect(() => {
    if (!game) return;

    if (game.prompt?.text) {
      setPrompt(game.prompt.text);
    }

    const scoreboardUserIds = new Set(scoreboard?.map((s) => s.userId) ?? []);

    const filteredParticipants =
      scoreboardUserIds.size > 0
        ? (game.participants ?? []).filter((p) => scoreboardUserIds.has(p.userId))
        : [];

    const mapped: Participant[] = filteredParticipants.map((p) => {
      const score = scoreboard?.find((s) => s.userId === p.userId);

      const life = score?.life ?? p.life ?? 3;

      return {
        participantId: p.userId,
        nickname: p.nickname,
        typedLength: p.typedLength ?? 0,
        progressPercent: p.progressPercent ?? 0,
        wpm: score?.wpm ?? p.wpm ?? 0,
        life,
        rank: score?.rank ?? p.rank ?? 0,
        accuracy: score?.accuracy ?? p.accuracy ?? 100,
        status: life === 0 ? "dead" : "playing",
      };
    });

    setParticipants(mapped);

    setWaitingState({
      playerCount: mapped.length,
      remainingSeconds: game.remainingSeconds ?? 23,
    });
  }, [game, scoreboard, setParticipants, setPrompt, setWaitingState]);
};
