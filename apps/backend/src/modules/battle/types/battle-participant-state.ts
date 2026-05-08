import type { ConnectionRole } from "./current-game-state";

export type BattleParticipantStatus = "playing" | "finished" | "eliminated" | "spectating";

export type BattleParticipantState = {
  acceptedLength: number;
  accuracy: number;
  eliminatedAt?: null | string;
  finishedAt?: null | string;
  gameId: string;
  lastInputAt: null | string;
  lastPenaltyIndex: null | number;
  life: number;
  wpm: number;
  participantId: string;
  progressPercent: number;
  role: ConnectionRole;
  socketId: string;
  status: BattleParticipantStatus;
  typoCount: number;
};
