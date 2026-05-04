import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { MatchService } from "../match/match.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../storage/redis/redis.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { SupabaseService } from "../storage/supabase/supabase.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "../users/users.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { GameStateDto } from "./dto/gameState.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { ParticipantDto, ParticipantExtendDto } from "./dto/participant.dto";

@Injectable()
export class GameStateService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly userService: UsersService,
    private readonly redisService: RedisService,
    private readonly matchService: MatchService,
  ) {}

  // 대전 이력 확인용
  async getGameResultById(userId: string, gameId: string) {
    await this.userService.getMyProfile(userId);

    const { data, error } = await this.supabaseService.instance
      .from("participants")
      .select("*")
      .eq("user_id", userId)
      .eq("game_id", gameId)
      .maybeSingle<ParticipantDto>();

    if (error) {
      throw new InternalServerErrorException("기록 불러오기에 실패했습니다.");
    }

    if (!data) {
      throw new NotFoundException("정보가 없습니다.");
    }

    return this.toParticipant(data);
  }

  async saveGameResult() {
    const gameData = await this.getCurrentGame();
    const chatData = await this.redisService.instance.lrange(`game:chat`, 0, -1);

    if (!gameData || gameData.participants.length === 0) {
      throw new BadRequestException("저장할 정보가 없습니다.");
    }

    const { error: gameError } = await this.supabaseService.instance.from("games").insert({
      id: gameData.game.id,
      status: false,
      started_at: gameData.game.startedAt,
      ended_at: new Date().toISOString(),
      total_players: gameData.participants.filter((p) => p.role === "player").length,
      winner_user_id: gameData.participants[0]?.userId ?? null,
    });

    if (gameError) {
      throw new InternalServerErrorException("게임 정보 저장에 실패했습니다.");
    }

    await Promise.all(
      gameData.participants
        .filter((p) => p.role === "player")
        .map(async (p) => {
          const { error } = await this.supabaseService.instance.from("participants").insert({
            game_id: gameData.game.id,
            user_id: p.userId,
            final_rank: p.rank,
            is_winner: p.rank === 1,
            is_survived: !p.isEliminated,
            life: p.life,
            wpm: p.wpm,
            accuracy: p.accuracy,
            created_at: new Date().toISOString(),
          });

          if (error) {
            throw new InternalServerErrorException("참가자 저장에 실패했습니다.");
          }
        }),
    );
    // 채팅 부분의 Database가 없어서 미뤄짐
    /*
    await Promise.all(
      chatData.map((raw) => {
        const msg = JSON.parse(raw);
        return this.supabaseService.instance.from("")
      })
    )
    */
  }

  async getCurrentGame() {
    const gameData = await this.redisService.instance.hgetall("game:current");

    if (!gameData || Object.keys(gameData).length === 0) {
      throw new NotFoundException("진행중인 게임이 없습니다.");
    }

    const participants = await this.matchService.getAllUsers();

    const totalPlayers = participants.filter((p) => p.role === "player").length;
    const spectatorCount = participants.filter((p) => p.role === "spectator").length;

    return {
      game: {
        id: gameData?.id ?? 0,
        phase: gameData?.status ?? "wait",
        startedAt: gameData?.started_at ?? "",
        minPlayers: 4,
        totalPlayers: totalPlayers,
        spectatorCount: spectatorCount,
        winnerUserId: gameData?.winnerUserId ?? null,
      },
      prompt: {
        // TODO: 프롬프트 설정
        id: 7,
        text: "빠른 갈색 여우가 게으른 개를 뛰어넘는다.",
        totalLength: 27,
      },
      participants: participants,
    };
  }

  async getCurrentSpectators() {
    const spectators = (await this.matchService.getAllUsers())
      .filter((p) => p.role === "spectator")
      .map((p) => ({ userId: p.userId, nickname: p.nickname, avatarUrl: p.avatarUrl }));

    return spectators;
  }

  async getCurrentScoreboard() {
    const players = (await this.matchService.getAllUsers()).filter((p) => p.role === "player");

    return players;
  }

  async getLatestGameResult() {
    const { data: game, error: gameError } = await this.supabaseService.instance
      .from("games")
      .select("*")
      .order("ended_at", { ascending: false })
      .limit(1)
      .maybeSingle<GameStateDto>();

    if (gameError) {
      throw new InternalServerErrorException("게임 결과 조회에 실패했습니다.");
    }

    if (!game) {
      throw new NotFoundException("종료된 게임이 없습니다.");
    }

    const { data: participants, error: participantsError } = await this.supabaseService.instance
      .from("participants")
      .select<"*, users (nickname, avatar_url)", ParticipantExtendDto>(
        "*, users (nickname, avatar_url)",
      )
      .eq("game_id", game.id)
      .order("final_rank", { ascending: true });

    if (participantsError) {
      throw new InternalServerErrorException("게임 결과 조회에 실패했습니다.");
    }

    if (!participants) {
      throw new NotFoundException("해당 게임의 참가자가 없습니다.");
    }

    return {
      gameId: game.id,
      startedAt: game.started_at,
      endedAt: game.ended_at,
      winner: participants[0]?.users?.nickname ?? "",
      rankings: participants,
    };
  }
  private toParticipant(row: ParticipantDto) {
    return {
      userId: row.user_id,
      gameId: row.game_id,
      chatId: row.chat_id,
      finalRank: row.final_rank,
      isWinner: row.is_winner,
      isSurvived: row.is_survived,
      life: row.life,
      wpm: row.wpm,
      accuracy: row.accuracy,
      createdAt: row.created_at,
    };
  }
}
