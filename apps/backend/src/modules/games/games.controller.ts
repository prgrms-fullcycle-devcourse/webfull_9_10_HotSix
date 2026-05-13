import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { GamesService } from "./games.service";

@ApiTags("games")
@Controller("v1/games/current")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: "현재 게임 조회" })
  getCurrentGame() {
    return this.gamesService.getCurrentGame();
  }

  @Get("scoreboard")
  @ApiOperation({ summary: "현재 게임 점수판 조회" })
  getCurrentScoreboard() {
    return this.gamesService.getCurrentScoreboard();
  }

  @Get("spectators")
  @ApiOperation({ summary: "현재 관전자 목록 조회" })
  getCurrentSpectators() {
    return this.gamesService.getCurrentSpectators();
  }

  @Get("result")
  @ApiOperation({ summary: "최근 게임 결과 조회" })
  getLatestGameResult() {
    return this.gamesService.getLatestGameResult();
  }
}
