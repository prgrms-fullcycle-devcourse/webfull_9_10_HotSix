import type { BattleParticipantStatus } from "./battle-participant-state";

export type BattleFinishReason = "completed" | "all_eliminated" | "time_limit";

export type BattleFinalStatus = "winner" | "finished" | "eliminated" | "playing";

export type BattleRankingEntry = {
  acceptedLength: number;
  accuracy: number;
  eliminatedAt: null | string;
  finalStatus: BattleFinalStatus;
  finishedAt: null | string;
  isWinner: boolean;
  life: number;
  participantId: string;
  progressPercent: number;
  rank: number;
  status: BattleParticipantStatus;
  wpm: number;
};

export type BattleGameResult = {
  finishedAt: string;
  gameId: string;
  rankings: BattleRankingEntry[];
  reason: BattleFinishReason;
  winnerParticipantId: null | string;
};
