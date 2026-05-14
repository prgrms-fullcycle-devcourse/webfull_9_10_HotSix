export type UserStatus = "alive" | "dead";
export type UserRole = "player" | "spectator";

export interface MatchUser {
  userId: string;
  nickname: string;
  avatarUrl: string;

  status: UserStatus;
  role: UserRole;

  joinedAt: string;

  progressPercent: number;
  rank: number;
  wpm: number;
  life: number;
  accuracy: number;

  isEliminated: boolean;
}
