import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../../storage/redis/redis.service";
import {
  BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS,
  getBattleActiveConnectionKey,
  getBattleSocketAuthTokenKey,
} from "../constants/battle-redis-keys";
import type { BattleParticipantState } from "../types/battle-participant-state";
import type {
  BattleActiveConnection,
  BattleSocketAuthSession,
} from "../types/battle-socket-session";
import type { CurrentGameState } from "../types/current-game-state";

const CURRENT_GAME_ID_KEY = "battle:current-game-id";
const BATTLE_TIMER_LOCK_KEY = "battle:timer-lock";

@Injectable()
export class BattleStateRepository {
  constructor(private readonly redisService: RedisService) {}

  async acquireTimerLock(lockToken: string, ttlSeconds: number) {
    const result = await this.redisService.instance.set(
      BATTLE_TIMER_LOCK_KEY,
      lockToken,
      "EX",
      ttlSeconds,
      "NX",
    );

    return result === "OK";
  }

  async setCurrentGameId(gameId: string) {
    await this.redisService.instance.set(CURRENT_GAME_ID_KEY, gameId);
  }

  async getCurrentGameId() {
    return this.redisService.instance.get(CURRENT_GAME_ID_KEY);
  }

  async saveCurrentGameState(gameState: CurrentGameState) {
    await this.setCurrentGameId(gameState.gameId);
    await this.setCurrentGameState(gameState.gameId, gameState);
  }

  async setCurrentGameState(gameId: string, gameState: CurrentGameState) {
    await this.redisService.instance.set(`battle:game:${gameId}:state`, JSON.stringify(gameState));
  }

  async getCurrentGameState() {
    const currentGameId = await this.getCurrentGameId();

    if (!currentGameId) {
      return null;
    }

    return this.getCurrentGameStateById(currentGameId);
  }

  async getCurrentGameStateById(gameId: string) {
    const value = await this.redisService.instance.get(`battle:game:${gameId}:state`);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as CurrentGameState;
  }

  async getActiveConnection(gameId: string, participantId: string) {
    const value = await this.redisService.instance.get(
      getBattleActiveConnectionKey(gameId, participantId),
    );

    if (!value) {
      return null;
    }

    return JSON.parse(value) as BattleActiveConnection;
  }

  async getParticipantState(gameId: string, participantId: string) {
    const value = await this.redisService.instance.get(
      `battle:game:${gameId}:participant:${participantId}`,
    );

    if (!value) {
      return null;
    }

    return JSON.parse(value) as BattleParticipantState;
  }

  async saveParticipantState(participantState: BattleParticipantState) {
    await this.redisService.instance.set(
      `battle:game:${participantState.gameId}:participant:${participantState.participantId}`,
      JSON.stringify(participantState),
    );
  }

  async deleteActiveConnection(gameId: string, participantId: string) {
    await this.redisService.instance.del(getBattleActiveConnectionKey(gameId, participantId));
  }

  async getSocketAuthSession(token: string) {
    const value = await this.redisService.instance.get(getBattleSocketAuthTokenKey(token));

    if (!value) {
      return null;
    }

    return JSON.parse(value) as BattleSocketAuthSession;
  }

  async resetPlayerStatus() {
    const userIds = await this.redisService.instance.smembers("lobby:players");
    const gameId = await this.getCurrentGameId();
    const profiles = await Promise.all(
      userIds.map(async (userId) => {
        const profile = await this.redisService.instance.hgetall(`lobby:player:${userId}`);
        return { userId, role: profile?.role };
      }),
    );

    await Promise.all(
      profiles
        .filter((p) => p.role === "player")
        .map(async (p) => {
          await this.redisService.instance.hset(
            `battle:game:${gameId}:participant:${p.userId}`,
            "progressPercent",
            "0",
            "wpm",
            "0",
            "life",
            "3",
            "accuracy",
            "100",
            "isEliminated",
            "false",
            "typedLength",
            "0",
          );
        }),
    );
    await this.redisService.instance.del("game:scoreboard");
  }

  async handleDisconnectUser(userId: string) {
    const gameId = await this.getCurrentGameId();
    await this.redisService.instance.hset(
      `battle:game:${gameId}:participant:${userId}`,
      "isEliminated",
      "true",
    );
  }

  async refreshSocketAuthSession(token: string) {
    await this.redisService.instance.expire(
      getBattleSocketAuthTokenKey(token),
      BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS,
    );
  }

  async saveActiveConnection(activeConnection: BattleActiveConnection) {
    await this.redisService.instance.set(
      getBattleActiveConnectionKey(activeConnection.gameId, activeConnection.participantId),
      JSON.stringify(activeConnection),
    );
  }
}
