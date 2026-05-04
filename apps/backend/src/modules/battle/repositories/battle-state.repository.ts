import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../../storage/redis/redis.service";
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
}
