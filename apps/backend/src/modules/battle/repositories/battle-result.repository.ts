import { Injectable, InternalServerErrorException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { SupabaseService } from "../../../storage/supabase/supabase.service";
import type { BattleGameResult } from "../types/battle-game-result";
import type { CurrentGameState } from "../types/current-game-state";

type SaveBattleGameResultInput = {
  currentGameState: CurrentGameState;
  result: BattleGameResult;
};

type SavedGameRow = {
  id: number;
};

@Injectable()
export class BattleResultRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async saveBattleGameResult(input: SaveBattleGameResultInput) {
    const { currentGameState, result } = input;
    const { data: game, error: gameError } = await this.supabaseService.instance
      .from("games")
      .insert({
        ended_at: result.finishedAt,
        started_at: currentGameState.gameStartedAt,
        total_players: String(result.rankings.length),
        winner_user_id: result.winnerParticipantId,
      })
      .select("id")
      .single<SavedGameRow>();

    if (gameError || !game) {
      throw new InternalServerErrorException("게임 결과 저장에 실패했습니다.");
    }

    if (result.rankings.length === 0) {
      return game;
    }

    const { error: participantsError } = await this.supabaseService.instance
      .from("participants")
      .insert(
        result.rankings.map((ranking) => ({
          accuracy: Math.round(ranking.accuracy),
          created_at: result.finishedAt.slice(0, 10),
          final_rank: ranking.rank,
          game_id: game.id,
          is_survived: ranking.status !== "eliminated",
          is_winner: ranking.isWinner,
          life: ranking.life,
          user_id: ranking.participantId,
          wpm: Math.round(ranking.wpm),
        })),
      );

    if (participantsError) {
      throw new InternalServerErrorException("참가자 결과 저장에 실패했습니다.");
    }

    return game;
  }
}
