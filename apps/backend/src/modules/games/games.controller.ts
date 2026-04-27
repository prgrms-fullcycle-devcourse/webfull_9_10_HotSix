import { Controller, Get } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { GamesService } from "./games.service";

@Controller("v1/games/current")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  getCurrentGame() {
    return this.gamesService.getCurrentGame();
  }

  @Get("scoreboard")
  getCurrentScoreboard() {
    return this.gamesService.getCurrentScoreboard();
  }

  @Get("spectators")
  getCurrentSpectators() {
    return this.gamesService.getCurrentSpectators();
  }

  @Get("result")
  getLatestGameResult() {
    return this.gamesService.getLatestGameResult();
  }
}
