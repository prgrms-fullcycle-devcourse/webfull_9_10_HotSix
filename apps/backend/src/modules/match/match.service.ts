// biome-ignore assist/source/organizeImports: <explanation>
import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import {
  BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS,
  getBattleSocketAuthTokenKey,
} from "../battle/constants/battle-redis-keys";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersRepository } from "../users/users.repository";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { MatchPlayerDto } from "./dto/match-player.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../../storage/redis/redis.service";

@Injectable()
export class MatchService {
  constructor(
    private readonly redisService: RedisService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async joinGame(userId: string) {
    const user = await this.usersRepository.findById(userId);

    const currentGameId = await this.redisService.instance.get("battle:current-game-id");
    const rawGamestate = currentGameId
      ? await this.redisService.instance.get(`battle:game:${currentGameId}:state`)
      : null;

    const gameState = rawGamestate ? JSON.parse(rawGamestate) : null;
    const gameStatus = gameState?.phase;

    const role = gameStatus === "in_progress" ? "spectator" : "player";
    const status = gameStatus === "in_progress" ? "spectating" : "waiting";
    const socketAuthToken = `ws_tk_${randomUUID()}`;

    await this.redisService.instance.sadd("lobby:players", userId);
    await this.redisService.instance.hset(
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
    await this.redisService.instance.set(
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
    const userIds = await this.redisService.instance.smembers("lobby:players");
    const currentGameId = await this.redisService.instance.get("battle:current-game-id");

    if (userIds.length === 0) return [];

    const players = await Promise.all(
      userIds.map(async (userId) => {
        const profile = await this.redisService.instance.hgetall(`lobby:player:${userId}`);
        if (!profile || Object.keys(profile).length === 0) return null;

        if (currentGameId) {
          const activeConnection = await this.redisService.instance.get(
            `battle:game:${currentGameId}:active-connection:${userId}`,
          );
          if (!activeConnection) return null;
        }

        return {
          userId: userId,
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          status: profile.status,
          role: profile.role as "player" | "spectator",
          joinedAt: profile.joinedAt,
        };
      }),
    );

    return players.filter((p): p is MatchPlayerDto => p !== null);
  }
}
