import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getGameDetail, getScoreBoard } from "@/api/game.api";
import { useGameStore } from "@/stores/useGameStore";
import type { Participant } from "@/types/game/participant";

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

  const { setParticipants, setPrompt } = useGameStore();

  useEffect(() => {
    if (!game) return;
    if (useGameStore.getState().participants.length > 0) return;

    if (game.prompt?.content) {
      setPrompt(game.prompt.content);
    }

    const scoreboardMap = new Map(scoreboard?.map((score) => [score.userId, score]) ?? []);

    const hasScoreboard = (scoreboard?.length ?? 0) > 0;

    const participants = game.participants ?? [];

    const playingParticipants = hasScoreboard
      ? participants.filter((participant) => scoreboardMap.has(participant.userId))
      : participants;

    const mapped: Participant[] = playingParticipants.map((p) => {
      const score = scoreboardMap.get(p.userId);

      const life = score?.life ?? p.life ?? 3;

      return {
        participantId: p.userId,
        nickname: p.nickname,
        acceptedLength: p.acceptedLength ?? 0,
        progressPercent: p.progressPercent ?? 0,
        wpm: score?.wpm ?? p.wpm ?? 0,
        life: p.life,
        rank: score?.rank ?? p.rank ?? 0,
        accuracy: score?.accuracy ?? p.accuracy ?? 100,
        status: life === 0 ? "eliminated" : "playing",
      };
    });

    setParticipants(mapped);
  }, [game, scoreboard, setParticipants, setPrompt]);
};
