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

    const scoreboardMap = new Map(scoreboard?.map((score) => [score.userId, score]) ?? []);

    const playingParticipants = (game.participants ?? []).filter((participant) =>
      scoreboardMap.has(participant.userId),
    );

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

    setWaitingState({
      playerCount: game.participants?.length ?? 0,
      remainingSeconds: game.remainingSeconds ?? 23,
    });
  }, [game, scoreboard, setParticipants, setPrompt, setWaitingState]);
};
