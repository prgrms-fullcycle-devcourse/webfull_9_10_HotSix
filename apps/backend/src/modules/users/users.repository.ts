import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { SupabaseService } from "../../storage/supabase/supabase.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { CreateGuestUserInput } from "./dto/create-guest-user.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UpdateDashboardInput } from "./dto/update-dashboard.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UpdateMyProfileInput } from "./dto/update-my-profile.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UserRowDto } from "./dto/userRow.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UserStatsDto } from "./dto/userStats.dto";

@Injectable()
export class UsersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createGuestUser(input: CreateGuestUserInput) {
    const { data, error: createUserError } = await this.supabaseService.instance
      .from("users")
      .insert({
        nickname: input.nickname,
        avatar_url: input.avatarUrl,
      })
      .select()
      .single<UserRowDto>();

    if (createUserError || !data) {
      throw new InternalServerErrorException("게스트 유저 생성에 실패했습니다.");
    }

    const { error: createDashboardError } = await this.supabaseService.instance
      .from("user_stats")
      .insert({ user_id: data.id });

    if (createDashboardError) {
      throw new InternalServerErrorException("유저 통계 생성에 실패했습니다.");
    }

    return this.toUserProfile(data);
  }

  async updateGuestUser(userId: string, input: UpdateMyProfileInput) {
    await this.findById(userId);
    const updatePayload: Record<string, string> = {};

    if (input.nickname) {
      updatePayload.nickname = input.nickname;
    }
    if (input.avatarUrl) {
      updatePayload.avatar_url = input.avatarUrl;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException("수정할 항목이 없습니다.");
    }

    const { data, error } = await this.supabaseService.instance
      .from("users")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single<UserRowDto>();

    if (error || !data) {
      throw new InternalServerErrorException("유저 정보 수정에 실패했습니다.");
    }

    return this.toUserProfile(data);
  }

  async deleteGuestUser(userId: string) {
    await this.findById(userId);

    const { error: deleteDashboardError } = await this.supabaseService.instance
      .from("user_stats")
      .delete()
      .eq("user_id", userId);
    if (deleteDashboardError) {
      throw new InternalServerErrorException("유저 정보 삭제에 실패했습니다.");
    }

    const { error: deleteUserError } = await this.supabaseService.instance
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteUserError) {
      throw new InternalServerErrorException("유저 삭제에 실패했습니다.");
    }
  }

  async findById(userId: string) {
    const { data, error } = await this.supabaseService.instance
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle<UserRowDto>();

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
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<UserStatsDto>();

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
      wpm: data?.wpm ?? 0,
      averageWordCount: data?.avg_word_count ?? 0,
      totalWordCount: data?.total_word_count ?? 0,
    };
  }

  async updateDashboardByUserId(userId: string, input: UpdateDashboardInput) {
    const user = await this.findById(userId);

    const updatePayload: Record<string, number> = {};

    if (input.totalGames !== undefined) updatePayload.total_games = input.totalGames;
    if (input.wins !== undefined) updatePayload.wins = input.wins;
    if (input.avgRank !== undefined) updatePayload.avg_rank = input.avgRank;
    if (input.wpm !== undefined) updatePayload.wpm = input.wpm;
    if (input.avgWordCount !== undefined) updatePayload.avg_word_count = input.avgWordCount;
    if (input.totalWordCount !== undefined) updatePayload.total_word_count = input.totalWordCount;

    if (Object.keys(updatePayload).length === 0) {
      throw new BadRequestException("수정할 항목이 없습니다.");
    }

    const { data, error } = await this.supabaseService.instance
      .from("user_stats")
      .update(updatePayload)
      .eq("user_id", userId)
      .select()
      .maybeSingle<UserStatsDto>();

    if (error) {
      throw new InternalServerErrorException("유저 통계 수정에 실패했습니다.");
    }

    return {
      userId: user.id,
      nickname: user.nickname,
      joinedAt: user.createdAt,
      totalGames: data?.total_games ?? 0,
      wins: data?.wins ?? 0,
      averageRank: data?.avg_rank ?? 0,
      wpm: data?.wpm ?? 0,
      averageWordCount: data?.avg_word_count ?? 0,
      totalWordCount: data?.total_word_count ?? 0,
    };
  }

  private toUserProfile(row: UserRowDto) {
    return {
      id: row.id,
      nickname: row.nickname,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
    };
  }
}
