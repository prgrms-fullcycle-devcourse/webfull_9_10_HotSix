import { Injectable } from "@nestjs/common";
import { v7 as uuidv7 } from "uuid";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleStateRepository } from "../repositories/battle-state.repository";

@Injectable()
export class BattleService {
  constructor(private readonly battleStateRepository: BattleStateRepository) {}

  async startNewGame() {
    const gameId = uuidv7();

    const gameState = {
      gameId,
      phase: "waiting" as const,
      playerCount: 0,
      minPlayers: 4,
      spectatorCount: 0,
      startsAt: null,
      startedAt: null,
      endedAt: null,
    };

    await this.battleStateRepository.setCurrentGameId(gameId);
    await this.battleStateRepository.setCurrentGameState(gameId, gameState);

    return gameState;
  }
}
