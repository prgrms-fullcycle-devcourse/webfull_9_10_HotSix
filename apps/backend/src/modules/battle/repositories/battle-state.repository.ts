import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../../storage/redis/redis.service";
import type { CurrentGameState } from "../types/current-game-state";

const CURRENT_GAME_ID_KEY = "battle:current-game-id";

@Injectable()
export class BattleStateRepository {
  constructor(private readonly redisService: RedisService) {}

  async setCurrentGameId(gameId: string) {
    await this.redisService.instance.set(CURRENT_GAME_ID_KEY, gameId);
  }

  async getCurrentGameId() {
    return this.redisService.instance.get(CURRENT_GAME_ID_KEY);
  }

  async setCurrentGameState(gameId: string, gameState: CurrentGameState) {
    await this.redisService.instance.set(`battle:game:${gameId}:state`, JSON.stringify(gameState));
  }

  async getCurrentGameState(gameId: string) {
    const value = await this.redisService.instance.get(`battle:game:${gameId}:state`);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as CurrentGameState;
  }
}
