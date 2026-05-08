import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../../../storage/redis/redis.service";
import {
  BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS,
  getBattleActiveConnectionKey,
  getBattleSocketAuthTokenKey,
} from "../constants/battle-redis-keys";
import type { BattleGameResult } from "../types/battle-game-result";
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

  async acquireGameFinishLock(gameId: string, lockToken: string, ttlSeconds: number) {
    const result = await this.redisService.instance.set(
      `battle:game:${gameId}:finish-lock`,
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

  async getPlayerParticipantStates(gameId: string) {
    const participantIds = await this.redisService.instance.zrange(
      `battle:game:${gameId}:scoreboard`,
      0,
      -1,
    );

    const participantStates = await Promise.all(
      participantIds.map((participantId) => this.getParticipantState(gameId, participantId)),
    );

    return participantStates.filter(
      (participantState): participantState is BattleParticipantState =>
        participantState?.role === "player",
    );
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

  async resetPlayerStatus(gameId: string) {
    if (!gameId) return;
    const userIds = await this.redisService.instance.smembers("lobby:players");

    await this.redisService.instance.del(`battle:game:${gameId}:scoreboard`);

    await Promise.all(
      userIds.map(async (userId) => {
        const profile = await this.redisService.instance.hgetall(`lobby:player:${userId}`);

        if (profile?.role !== "player") {
          return;
        }
        const previousState = await this.getParticipantState(gameId, userId);

        const nextState: BattleParticipantState = {
          acceptedLength: 0,
          accuracy: 100,
          eliminatedAt: null,
          finishedAt: null,
          gameId,
          lastInputAt: null,
          lastPenaltyIndex: null,
          life: 3,
          participantId: userId,
          progressPercent: 0,
          role: "player",
          wpm: 0,
          socketId: previousState?.socketId ?? profile.socketId ?? "",
          status: "playing",
          typoCount: 0,
        };
        await this.saveParticipantState(nextState);
        await this.redisService.instance.zadd(`battle:game:${gameId}:scoreboard`, 0, userId);
      }),
    );
  }

  async handleDisconnectUser(userId: string) {
    const gameId = await this.getCurrentGameId();

    if (!gameId) return;

    const participantState = await this.getParticipantState(gameId, userId);

    if (!participantState) return;

    if (participantState.status === "eliminated" || participantState.status === "finished") {
      return;
    }

    const disconnectedAt = new Date().toISOString();

    await this.saveParticipantState({
      ...participantState,
      eliminatedAt: participantState.eliminatedAt ?? disconnectedAt,
      life: 0,
      status: "eliminated",
      lastInputAt: disconnectedAt,
    });
  }

  async saveGameResult(result: BattleGameResult) {
    await this.redisService.instance.set(
      `battle:game:${result.gameId}:result`,
      JSON.stringify(result),
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
  async updateScoreboard(participantState: BattleParticipantState) {
    if (participantState.role !== "player") {
      return;
    }

    await this.redisService.instance.zadd(
      `battle:game:${participantState.gameId}:scoreboard`,
      participantState.acceptedLength,
      participantState.participantId,
    );
  }
}
