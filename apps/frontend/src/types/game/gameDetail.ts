export interface GameDetailResponse {
  game: {
    id: number;
    phase: "waiting" | "in_progress" | "finished";
    minPlayers: number;
    totalPlayers: number;
    spectatorCount: number;
    winnerUserId: string | null;
  };
  prompt: {
    id: number;
    text: string;
    totalLength: number;
  };
  participants: {
    userId: string;
    nickname: string;
    avatarUrl: string;
    role: "player" | "spectator";
    status: "waiting" | "alive" | "eliminated" | "finished" | "spectating" | "disconnected";
    progressPercent: number;
    typedLength: number;
    rank: number;
    wpm: number;
    accuracy: number;
  }[];
}
