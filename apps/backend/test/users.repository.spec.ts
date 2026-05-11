import { UsersRepository } from "../src/modules/users/users.repository";
import type { SupabaseService } from "../src/storage/supabase/supabase.service";

describe("UsersRepository battle stats", () => {
  it("accumulates user_stats after a battle result", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        avg_rank: 2,
        avg_word_count: 100,
        total_games: 2,
        total_word_count: 200,
        wins: 1,
        wpm: 60,
      },
      error: null,
    });
    const eq = jest.fn(() => ({ maybeSingle }));
    const select = jest.fn(() => ({ eq }));
    const upsert = jest.fn().mockResolvedValue({ error: null });
    let callCount = 0;
    const from = jest.fn(() => {
      callCount++;
      if (callCount === 1) return { select };
      return { upsert };
    });
    const repository = new UsersRepository({
      instance: {
        from,
      },
    } as unknown as SupabaseService);

    await repository.recordBattleResult({
      acceptedLength: 150,
      isWinner: true,
      rank: 1,
      userId: "user-1",
      wpm: 90,
    });

    expect(from).toHaveBeenCalledWith("user_stats");
    expect(upsert).toHaveBeenCalledWith(
      {
        avg_rank: 2,
        avg_word_count: 117,
        total_games: 3,
        total_word_count: 350,
        updated_at: expect.any(Number),
        user_id: "user-1",
        wins: 2,
        wpm: 70,
      },
      { onConflict: "user_id" },
    );
  });
});
