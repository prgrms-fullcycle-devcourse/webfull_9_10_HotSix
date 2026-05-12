import { BattleResultRepository } from "../src/modules/battle/repositories/battle-result.repository";
import type { BattleGameResult } from "../src/modules/battle/types/battle-game-result";
import type { CurrentGameState } from "../src/modules/battle/types/current-game-state";
import type { SupabaseService } from "../src/storage/supabase/supabase.service";

const currentGameState: CurrentGameState = {
  createdAt: "2026-05-06T00:00:00.000Z",
  gameEndedAt: "2026-05-06T00:16:00.000Z",
  gameId: "battle-game-1",
  gameStartedAt: "2026-05-06T00:01:00.000Z",
  hasTenSecondNoticeSent: false,
  minPlayers: 4,
  phase: "finished",
  playerCount: 2,
  prompt: {
    content: "hello",
    contentLength: 5,
    id: 7,
    slug: "hello",
    title: "Hello",
  },
  spectatorCount: 0,
  updatedAt: "2026-05-06T00:16:00.000Z",
  waitingEndsAt: null,
  waitingStartedAt: null,
};

const result: BattleGameResult = {
  finishedAt: "2026-05-06T00:16:00.000Z",
  gameId: "battle-game-1",
  rankings: [
    {
      acceptedLength: 5,
      accuracy: 99.7,
      eliminatedAt: null,
      finalStatus: "winner",
      finishedAt: "2026-05-06T00:15:55.000Z",
      isWinner: true,
      life: 3,
      participantId: "user-1",
      progressPercent: 100,
      rank: 1,
      status: "finished",
      wpm: 82.4,
    },
    {
      acceptedLength: 3,
      accuracy: 88.2,
      eliminatedAt: "2026-05-06T00:12:00.000Z",
      finalStatus: "eliminated",
      finishedAt: null,
      isWinner: false,
      life: 0,
      participantId: "user-2",
      progressPercent: 60,
      rank: 2,
      status: "eliminated",
      wpm: 51.1,
    },
  ],
  reason: "completed",
  winnerParticipantId: "user-1",
};

describe("BattleResultRepository", () => {
  it("stores finished game and participant snapshots", async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: 101 }, error: null });
    const select = jest.fn(() => ({ single }));
    const gamesInsert = jest.fn(() => ({ select }));
    const participantsInsert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn((table: string) => ({
      insert: table === "games" ? gamesInsert : participantsInsert,
    }));
    const repository = new BattleResultRepository({
      instance: {
        from,
      },
    } as unknown as SupabaseService);

    await repository.saveBattleGameResult({ currentGameState, result });

    expect(gamesInsert).toHaveBeenCalledWith({
      ended_at: result.finishedAt,
      id: result.gameId,
      started_at: currentGameState.gameStartedAt,
      total_players: "2",
      winner_user_id: "user-1",
    });
    expect(participantsInsert).toHaveBeenCalledWith([
      {
        accuracy: 100,
        created_at: "2026-05-06",
        final_rank: 1,
        game_id: 101,
        is_survived: true,
        is_winner: true,
        life: 3,
        user_id: "user-1",
        wpm: 82,
      },
      {
        accuracy: 88,
        created_at: "2026-05-06",
        final_rank: 2,
        game_id: 101,
        is_survived: false,
        is_winner: false,
        life: 0,
        user_id: "user-2",
        wpm: 51,
      },
    ]);
  });
});
