export type GamePhase = "waiting" | "in_progress" | "finished";

export type CurrentGameState = {
  gameId: string;
  phase: GamePhase;
  minPlayers: number;
  playerCount: number;
  spectatorCount: number;
  startsAt: null | string;
  startedAt: null | string;
  endedAt: null | string;
};
