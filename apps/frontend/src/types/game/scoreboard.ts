export interface ScoreboardItem {
  userId: string;
  nickname: string;
  avatarUrl: string;
  status: "alive" | "dead";
  role: string;
  joinedAt: string;
  progressPercent: number;
  rank: number;
  wpm: number;
  life: number;
  accuracy: number;
  isEliminated: boolean;
}
