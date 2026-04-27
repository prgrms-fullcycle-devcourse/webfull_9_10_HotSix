import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { GamesRepository } from "./games.repository";

@Injectable()
export class GamesService {
  constructor(private readonly gamesRepository: GamesRepository) {}

  getCurrentGame() {
    return this.gamesRepository.findCurrentGame();
  }

  getCurrentScoreboard() {
    return this.gamesRepository.findCurrentScoreboard();
  }

  getCurrentSpectators() {
    return this.gamesRepository.findCurrentSpectators();
  }

  getLatestGameResult() {
    return this.gamesRepository.findLatestGameResult();
  }
}
