export type MatchPlayerDto = {
  userId: string;
  nickname: string;
  avatarUrl: string;
  status: string;
  role: "player" | "spectator";
  joinedAt: string;
  progressPercent: number;
  rank: number;
  wpm: number;
  life: number;
  accuracy: number;
  isEliminated: boolean;
};
