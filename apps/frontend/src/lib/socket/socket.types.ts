export type BattlePhase = "waiting" | "in_progress" | "finished";

// export interface BattleWaitingPayload {
//   gameId: string;
//   phase: BattlePhase;
//   remainingSeconds: number;
//   playerCount: number;
//   spectatorCount: number;
// }

export interface BattleStatePayload {
  gameId: string;
  phase: BattlePhase;

  prompt: {
    id: number;
    title: string;
    content?: string;
    contentLength: number;
  };

  minPlayers: number;
  playerCount: number;
  spectatorCount: number;

  gameStartedAt: string | null;
  gameEndedAt: string | null;
}

export interface BattleWaitingPayload {
  gameId: string;
  phase: "waiting";
  remainingSeconds: number;

  minPlayers: number;
  playerCount: number;
  spectatorCount: number;

  prompt: {
    id: number;
    title: string;
    contentLength: number;
  };
}

export interface BattleStartedPayload {
  gameId: string;
  phase: "in_progress";

  prompt: {
    id: number;
    slug: string;
    title: string;
    content: string;
    contentLength: number;
  };

  gameStartedAt: string;
}

export interface BattleProgressPayload {
  gameId: string;

  participant: {
    participantId: string;
    socketId: string;
    role: "player" | "spectator";
    status: "playing" | "dead";

    acceptedLength: number;
    progressPercent: number;
    accuracy: number;
    life: number;
    typoCount: number;
    lastInputAt: string;
  };
}

export interface BattleEliminatedPayload {
  gameId: string;
  userId: string;
  participantId: string;
  socketId: string;
  reason: "typo" | "timeout" | "disconnect";
}
