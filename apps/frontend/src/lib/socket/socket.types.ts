export type BattlePhase = "waiting" | "in_progress" | "finished";

export interface BattleWaitingPayload {
  gameId: string;
  phase: BattlePhase;
  remainingSeconds: number;
  playerCount: number;
  spectatorCount: number;
}
