import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import {
  BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS,
  getBattleSocketAuthTokenKey,
} from "../battle/constants/battle-redis-keys";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../storage/redis/redis.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersRepository } from "../users/users.repository";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { MatchPlayerDto } from "./dto/match-player.dto";

@Injectable()
export class MatchService {
  constructor(
    private readonly redis: RedisService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async joinGame(userId: string) {
    const user = await this.usersRepository.findById(userId);

    const gameStatus = await this.redis.instance.hget("game:current", "status");
    const role = gameStatus === "in_progress" ? "spectator" : "player";
    const status = gameStatus === "in_progress" ? "spectating" : "waiting";
    const socketAuthToken = `ws_tk_${randomUUID()}`;

    await this.redis.instance.sadd("lobby:players", userId);
    await this.redis.instance.hset(
      `lobby:player:${userId}`,
      "nickname",
      user.nickname,
      "avatarUrl",
      user.avatarUrl,
      "status",
      status,
      "role",
      role,
      "joinedAt",
      new Date().toISOString(),
    );
    await this.redis.instance.set(
      getBattleSocketAuthTokenKey(socketAuthToken),
      JSON.stringify({
        issuedAt: new Date().toISOString(),
        userId,
      }),
      "EX",
      BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS,
    );

    return {
      userId,
      role: role,
      status: status,
      socketNamespace: "/battle",
      socketAuthToken,
    };
  }

  async getAllUsers(): Promise<MatchPlayerDto[]> {
    const userIds = await this.redis.instance.smembers("lobby:players");

    if (userIds.length === 0) return [];

    const players = await Promise.all(
      userIds.map(async (userId) => {
        const profile = await this.redis.instance.hgetall(`lobby:player:${userId}`);
        const gameData = await this.redis.instance.hgetall(`lobby:player:${userId}:state`);
        if (!profile || Object.keys(profile).length === 0) return null;

        return {
          userId: userId,
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          status: profile.status,
          role: profile.role as "player" | "spectator",
          joinedAt: profile.joinedAt,

          progressPercent: Number(gameData?.progress ?? 0),
          rank: Number(gameData?.rank ?? 0),
          wpm: Number(gameData?.wpm ?? 0),
          life: Number(gameData?.life ?? 0),
          accuracy: Number(gameData?.accuracy ?? 0),
          isEliminated: gameData?.isEliminated === "true",
        };
      }),
    ).then((players) =>
      players
        .filter((p): p is MatchPlayerDto => p !== null)
        .sort((a, b) => {
          if (a.rank === 0 && b.rank === 0) return 0;
          if (a.rank === 0) return 1; // rank 0은 뒤로
          if (b.rank === 0) return -1;
          return a.rank - b.rank;
        }),
    );

    return players;
  }
}
