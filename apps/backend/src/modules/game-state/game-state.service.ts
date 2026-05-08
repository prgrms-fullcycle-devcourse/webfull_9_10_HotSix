import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../../storage/redis/redis.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { SupabaseService } from "../../storage/supabase/supabase.service";
import type { BattleRankingEntry } from "../battle/types/battle-game-result";

// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { MatchService } from "../match/match.service";
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
    // 채팅 부분의 Database가 없어서 미뤄짐
    /*
    const chatData = await this.redisService.instance.lrange(`game:chat`, 0, -1);
    */
    if (!gameData || gameData.participants.length === 0) {
      throw new BadRequestException("저장할 정보가 없습니다.");
    }

    const { error: gameError } = await this.supabaseService.instance.from("games").insert({
      id: gameData.game.id,
      status: gameData.game.phase,
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
    const currentGameId = await this.redisService.instance.get("battle:current-game-id");
    const redisData = (await this.redisService.instance.get(
      `battle:game:${currentGameId}:state`,
    )) as string;

    if (!redisData) {
      throw new NotFoundException("진행중인 게임이 없습니다.");
    }

    const gameData = JSON.parse(redisData);
    const players = await this.getCurrentScoreboard();
    const spectators = await this.getCurrentSpectators();

    return {
      game: {
        id: gameData?.gameId ?? 0,
        phase: gameData?.phase ?? "wait",
        startedAt: gameData?.gameStartedAt ?? "",
        minPlayers: gameData?.minPlayers ?? 4,
        playerCount: players.length,
        spectatorCount: spectators.length,
        waitingStartedAt: gameData?.waitingStartedAt ?? "",
        waitingEndsAt: gameData?.waitingEndsAt ?? "",
        gameStartedAt: gameData?.gameStartedAt ?? "",
        gameEndedAt: gameData?.gameEndedAt ?? "",
        createdAt: gameData?.createdAt ?? "",
        updatedAt: gameData?.updatedAt ?? "",
      },
      prompt: {
        id: gameData?.prompt.id,
        slug: gameData?.prompt.slug,
        title: gameData?.prompt.title,
        content: gameData?.prompt.content,
        contentLength: gameData?.prompt.contentLength,
        language: gameData?.prompt.language,
      },
      participants: [
        ...players,
        ...spectators.map((p) => ({
          userId: p.userId,
          nickname: p.nickname,
          avatarUrl: p.avatarUrl,
          status: "spectating",
          role: "spectator" as const,
          joinedAt: p.joinedAt,
          progressPercent: 0,
          rank: 0,
          wpm: 0,
          life: 0,
          accuracy: 0,
          isEliminated: false,
          acceptedLength: 0,
        })),
      ],
    };
  }

  async getCurrentSpectators() {
    const spectators = (await this.matchService.getAllUsers())
      .filter((p) => p.role === "spectator")
      .map((p) => ({
        userId: p.userId,
        nickname: p.nickname,
        avatarUrl: p.avatarUrl,
        joinedAt: p.joinedAt,
      }));

    return spectators;
  }

  async getCurrentScoreboard() {
    const currentGameId = await this.redisService.instance.get("battle:current-game-id");
    const rawGameState = await this.redisService.instance.get(`battle:game:${currentGameId}:state`);

    if (rawGameState) {
      const gameState = JSON.parse(rawGameState) as {
        phase?: string;
        rankings?: BattleRankingEntry[];
      };

      if (gameState.phase === "finished" && Array.isArray(gameState.rankings)) {
        return this.getFinishedScoreboard(gameState.rankings);
      }
    }

    const rows = await this.redisService.instance.zrevrange(
      `battle:game:${currentGameId}:scoreboard`,
      0,
      -1,
      "WITHSCORES",
    );

    const rankedUsers = [];

    for (let i = 0; i < rows.length; i += 2) {
      const userId = rows[i];
      const score = rows[i + 1];

      if (!userId) {
        continue;
      }

      rankedUsers.push({
        userId,
        score: Number(score ?? 0),
        rank: i / 2 + 1,
      });
    }

    const players = await Promise.all(
      rankedUsers.map(async ({ userId, rank }) => {
        const profile = await this.redisService.instance.hgetall(`lobby:player:${userId}`);
        const rawParticipant = await this.redisService.instance.get(
          `battle:game:${currentGameId}:participant:${userId}`,
        );

        if (!rawParticipant) return null;

        const participant = JSON.parse(rawParticipant);

        if (participant.role !== "player") return null;

        return {
          userId,
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          status: participant.status,
          role: participant.role,
          joinedAt: profile.joinedAt,
          progressPercent: participant.progressPercent,
          rank,
          wpm: participant.wpm ?? 0,
          life: participant.life,
          accuracy: participant.accuracy,
          isEliminated: participant.status === "eliminated",
          acceptedLength: participant.acceptedLength,
        };
      }),
    );

    return players.filter((p): p is NonNullable<typeof p> => p !== null);
  }

  private async getFinishedScoreboard(rankings: BattleRankingEntry[]) {
    const players = await Promise.all(
      rankings.map(async (ranking) => {
        const profile = await this.redisService.instance.hgetall(
          `lobby:player:${ranking.participantId}`,
        );

        return {
          userId: ranking.participantId,
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          status: ranking.status,
          role: "player" as const,
          joinedAt: profile.joinedAt,
          progressPercent: ranking.progressPercent,
          rank: ranking.rank,
          wpm: ranking.wpm,
          life: ranking.life,
          accuracy: ranking.accuracy,
          isEliminated: ranking.status === "eliminated",
          acceptedLength: ranking.acceptedLength,
          finalStatus: ranking.finalStatus,
          isWinner: ranking.isWinner,
        };
      }),
    );

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
