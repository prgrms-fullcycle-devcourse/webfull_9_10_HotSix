import type { PromptSnapshot } from "./prompt-snapshot";

export type ConnectionRole = "player" | "spectator";

export type GamePhase = "waiting" | "in_progress" | "finished";

export type CurrentGameState = {
  gameId: string;
  phase: GamePhase;
  createdAt: string;
  gameEndedAt: null | string;
  gameStartedAt: null | string;
  hasTenSecondNoticeSent: boolean;
  minPlayers: number;
  playerCount: number;
  prompt: PromptSnapshot;
  spectatorCount: number;
  updatedAt: string;
  waitingEndsAt: null | string;
  waitingStartedAt: null | string;
};
