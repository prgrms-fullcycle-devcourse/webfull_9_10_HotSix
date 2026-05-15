import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getGameDetail, getLatestGameResult, getScoreBoard } from "@/api/game.api";
import { useGameStore } from "@/stores/useGameStore";
import type { Participant } from "@/types/game/participant";

export const useGameDetail = (
  options: { enabled?: boolean; refetchInterval?: false | number } = {},
) => {
  return useQuery({
    queryKey: ["gameDetail"],
    queryFn: getGameDetail,
    retry: false,
    ...options,
  });
};

export const useScoreboard = () => {
  return useQuery({
    queryKey: ["scoreboard"],
    queryFn: getScoreBoard,
    retry: false,
  });
};

export const useLatestGameResult = (enabled = true) => {
  return useQuery({
    queryKey: ["latestGameResult"],
    queryFn: getLatestGameResult,
    enabled,
    retry: false,
  });
};

export const useGameData = () => {
  const { data: game } = useGameDetail();
  const { data: scoreboard } = useScoreboard();

  const { setGameCounts, setParticipants, setPrompt, setPhase, setWaitingState } = useGameStore();

  useEffect(() => {
    if (!game) return;

    if (game.prompt?.content) {
      setPrompt(game.prompt.content);
    }

    setPhase(game.game.phase);
    setGameCounts({
      minPlayers: game.game.minPlayers,
      spectatorCount: game.game.spectatorCount,
    });

    if (game.game.phase === "waiting") {
      const waitingPlayers = (game.participants ?? [])
        .filter((participant) => participant.role === "player")
        .map((participant) => ({
          userId: participant.userId,
          nickname: participant.nickname,
          avatarUrl: participant.avatarUrl,
          joinedAt: participant.joinedAt,
        }));

      setWaitingState({
        playerCount: game.game.playerCount,
        remainingSeconds: game.remainingSeconds ?? 0,
        minPlayers: game.game.minPlayers,
        spectatorCount: game.game.spectatorCount,
        waitingPlayers,
      });
      return;
    }

    const scoreboardMap = new Map(scoreboard?.map((score) => [score.userId, score]) ?? []);

    const hasScoreboard = (scoreboard?.length ?? 0) > 0;

    const participants = game.participants ?? [];

    const playingParticipants = (
      hasScoreboard
        ? participants.filter((participant) => scoreboardMap.has(participant.userId))
        : participants
    ).filter((participant) => participant.role === "player");

    const mapped: Participant[] = playingParticipants.map((p) => {
      const score = scoreboardMap.get(p.userId);

      const life = score?.life ?? p.life ?? 3;
      const status = p.status === "waiting" ? "playing" : p.status;

      return {
        participantId: p.userId,
        nickname: p.nickname,
        acceptedLength: p.acceptedLength ?? 0,
        progressPercent: p.progressPercent ?? 0,
        wpm: score?.wpm ?? p.wpm ?? 0,
        life,
        rank: score?.rank ?? p.rank ?? 0,
        accuracy: score?.accuracy ?? p.accuracy ?? 100,
        status: life === 0 ? "eliminated" : status,
      };
    });

    setParticipants(mapped);
  }, [game, scoreboard, setGameCounts, setParticipants, setPhase, setPrompt, setWaitingState]);
};
