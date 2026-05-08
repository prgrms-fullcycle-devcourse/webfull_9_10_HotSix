export type MatchPlayerDto = {
  userId: string;
  nickname: string;
  avatarUrl: string;
  status: string;
  role: "player" | "spectator";
  joinedAt: string;
};
