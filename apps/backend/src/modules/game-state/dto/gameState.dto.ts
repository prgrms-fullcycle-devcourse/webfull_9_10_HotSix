export type GameStateDto = {
  id: string;
  status: boolean;
  started_at: string;
  ended_at: string;
  total_players: number;
  winner_user_id: string;
};
