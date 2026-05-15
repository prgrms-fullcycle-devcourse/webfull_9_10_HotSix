export interface LatestGameResultRanking {
  accuracy?: number;
  created_at?: string;
  final_rank?: number;
  game_id: string;
  is_survived?: boolean;
  is_winner?: boolean;
  life?: number;
  user_id: string;
  users?: {
    avatar_url?: string;
    nickname?: string;
  };
  wpm?: number;
}

export interface LatestGameResultResponse {
  endedAt: string;
  gameId: string;
  rankings: LatestGameResultRanking[];
  startedAt: string;
  winner: string;
}
