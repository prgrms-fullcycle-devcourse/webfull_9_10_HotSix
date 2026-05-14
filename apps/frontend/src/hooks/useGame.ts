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

  const { setParticipants, setPrompt } = useGameStore();

  useEffect(() => {
    if (!game) return;
    if (useGameStore.getState().participants.length > 0) return;

    if (game.prompt?.text) {
      setPrompt(game.prompt.text);
    }

    const scoreboardMap = new Map(scoreboard?.map((score) => [score.userId, score]) ?? []);

    const hasScoreboard = (scoreboard?.length ?? 0) > 0;

    const participants = game.participants ?? [];

    const playingParticipants = hasScoreboard
      ? participants.filter((participant) => scoreboardMap.has(participant.userId))
      : participants;

    const mapped: Participant[] = playingParticipants.map((participant) => {
      const score = scoreboardMap.get(participant.userId);

      const life = score?.life ?? participant.life ?? 3;

      return {
        participantId: participant.userId,
        nickname: participant.nickname,
        typedLength: participant.typedLength ?? 0,
        progressPercent: participant.progressPercent ?? 0,
        wpm: score?.wpm ?? participant.wpm ?? 0,
        life,
        rank: score?.rank ?? participant.rank ?? 0,
        accuracy: score?.accuracy ?? participant.accuracy ?? 100,
        status: life === 0 ? "dead" : "playing",
      };
    });

    setParticipants(mapped);
  }, [game, scoreboard, setParticipants, setPrompt]);
};
