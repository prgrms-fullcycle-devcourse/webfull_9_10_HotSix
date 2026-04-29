import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { SupabaseService } from "../storage/supabase/supabase.service";

type UserRow = {
  id: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
};

type UserStatsRow = {
  total_games: number;
  wins: number;
  avg_rank: number;
  best_rank: number;
  recent_rank: number;
  wpm: number;
  accuracy: number;
};

type CreateGuestUserInput = {
  nickname: string;
  avatarUrl: string;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createGuestUser(input: CreateGuestUserInput) {
    const { data, error } = await this.supabaseService.instance
      .from("users")
      .insert({
        nickname: input.nickname,
        avatar_url: input.avatarUrl,
      })
      .select()
      .single<UserRow>();

    if (error || !data) {
      throw new InternalServerErrorException("게스트 유저 생성에 실패했습니다.");
    }

    return this.toUserProfile(data);
  }

  async findById(userId: string) {
    const { data, error } = await this.supabaseService.instance
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle<UserRow>();

    if (error) {
      throw new InternalServerErrorException("유저 조회에 실패했습니다.");
    }

    if (!data) {
      throw new NotFoundException({
        code: "USER_NOT_FOUND",
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    return this.toUserProfile(data);
  }

  async findDashboardByUserId(userId: string) {
    const user = await this.findById(userId);

    const { data, error } = await this.supabaseService.instance
      .from("user_stats")
      .select("total_games, wins, avg_rank, best_rank, recent_rank, wpm, accuracy")
      .eq("user_id", userId)
      .maybeSingle<UserStatsRow>();

    if (error) {
      throw new InternalServerErrorException("유저 통계 조회에 실패했습니다.");
    }

    return {
      userId: user.id,
      nickname: user.nickname,
      joinedAt: user.createdAt,
      totalGames: data?.total_games ?? 0,
      wins: data?.wins ?? 0,
      averageRank: data?.avg_rank ?? 0,
      recentRank: data?.recent_rank ?? 0,
      bestRank: data?.best_rank ?? 0,
      averageWpm: data?.wpm ?? 0,
      averageAccuracy: data?.accuracy ?? 0,
    };
  }

  private toUserProfile(row: UserRow) {
    return {
      id: row.id,
      nickname: row.nickname,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
    };
  }
}
