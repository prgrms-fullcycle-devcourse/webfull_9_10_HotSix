export type Status = "waiting" | "playing" | "finished" | "eliminated" | "spectating";

export interface GameDetailResponse {
  game: {
    id: string;
    phase: "waiting" | "in_progress" | "finished";
    startedAt: string;
    minPlayers: number;
    playerCount: number;
    spectatorCount: number;

    waitingStartedAt: string;
    waitingEndsAt: string;

    gameStartedAt: string;
    gameEndedAt: string | null;

    createdAt: string;
    updatedAt: string;
  };

  prompt: {
    id: number;
    slug: string;
    title: string;
    content: string;
    contentLength: number;
    language: string;
  };

  participants: {
    userId: string;
    nickname: string;
    avatarUrl: string;
    status: Status;
    role: "player" | "spectator";
    joinedAt: string;
    progressPercent: number;
    rank: number;
    wpm: number;
    life: number;
    accuracy: number;
    isEliminated: boolean;
    acceptedLength: number;
  }[];

  remainingSeconds?: number;
}
