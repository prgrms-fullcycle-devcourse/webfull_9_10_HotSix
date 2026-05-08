import type { BattleFinishReason, BattleRankingEntry } from "./battle-game-result";
import type { PromptSnapshot } from "./prompt-snapshot";

export type ConnectionRole = "player" | "spectator";

export type GamePhase = "waiting" | "in_progress" | "finished";

export type CurrentGameState = {
  gameId: string;
  phase: GamePhase;
  createdAt: string;
  finishReason?: BattleFinishReason | null;
  gameEndedAt: null | string;
  gameStartedAt: null | string;
  hasTenSecondNoticeSent: boolean;
  minPlayers: number;
  nextWaitingStartsAt?: null | string;
  playerCount: number;
  prompt: PromptSnapshot;
  rankings?: BattleRankingEntry[];
  spectatorCount: number;
  updatedAt: string;
  waitingEndsAt: null | string;
  waitingStartedAt: null | string;
  winnerParticipantId?: null | string;
};
