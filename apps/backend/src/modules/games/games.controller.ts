import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import {
  CurrentGameResponseDto,
  CurrentScoreboardEntryDto,
  CurrentSpectatorDto,
  LatestGameResultResponseDto,
} from "./dto/games-response.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { GamesService } from "./games.service";

@ApiTags("games")
@Controller("v1/games/current")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: "현재 게임 조회" })
  @ApiOkResponse({
    description: "현재 게임 조회 성공",
    type: CurrentGameResponseDto,
    example: {
      game: {
        id: "f2f796d1-5300-4b95-abf7-7761f5328d93",
        phase: "waiting",
        startedAt: "2026-05-13T04:00:00.000Z",
        minPlayers: 4,
        playerCount: 3,
        spectatorCount: 1,
        waitingStartedAt: "2026-05-13T03:59:30.000Z",
        waitingEndsAt: "2026-05-13T04:00:00.000Z",
        gameStartedAt: "2026-05-13T04:00:00.000Z",
        gameEndedAt: "",
        createdAt: "2026-05-13T03:59:30.000Z",
        updatedAt: "2026-05-13T04:00:01.000Z",
      },
      prompt: {
        id: "prompt-2026-05-13-01",
        slug: "daily-korean-typing-1",
        title: "오늘의 타자 연습",
        content: "빠르게 입력하며 정확도를 유지해보세요.",
        contentLength: 23,
        language: "ko",
      },
      participants: [
        {
          userId: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
          nickname: "민첩한여우5832",
          avatarUrl: "https://cdn.example.com/avatars/owl-1.png",
          status: "waiting",
          role: "player",
          joinedAt: "2026-05-13T04:00:00.000Z",
          progressPercent: 64,
          rank: 1,
          wpm: 376.4,
          life: 3,
          accuracy: 97.4,
          isEliminated: false,
          acceptedLength: 148,
        },
      ],
    },
  })
  getCurrentGame() {
    return this.gamesService.getCurrentGame();
  }

  @Get("scoreboard")
  @ApiOperation({ summary: "현재 게임 점수판 조회" })
  @ApiOkResponse({
    description: "현재 게임 점수판 조회 성공",
    type: CurrentScoreboardEntryDto,
    isArray: true,
    example: [
      {
        userId: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
        nickname: "민첩한여우5832",
        avatarUrl: "https://cdn.example.com/avatars/owl-1.png",
        status: "typing",
        role: "player",
        joinedAt: "2026-05-13T04:00:00.000Z",
        progressPercent: 64,
        rank: 1,
        wpm: 376.4,
        life: 3,
        accuracy: 97.4,
        isEliminated: false,
        acceptedLength: 148,
      },
    ],
  })
  getCurrentScoreboard() {
    return this.gamesService.getCurrentScoreboard();
  }

  @Get("spectators")
  @ApiOperation({ summary: "현재 관전자 목록 조회" })
  @ApiOkResponse({
    description: "현재 관전자 목록 조회 성공",
    type: CurrentSpectatorDto,
    isArray: true,
    example: [
      {
        userId: "7f1a3b47-6d3b-4f0c-930d-82914f0ac221",
        nickname: "질주하는매4012",
        avatarUrl: "https://cdn.example.com/avatars/hawk-1.png",
        joinedAt: "2026-05-13T04:00:00.000Z",
      },
    ],
  })
  getCurrentSpectators() {
    return this.gamesService.getCurrentSpectators();
  }

  @Get("result")
  @ApiOperation({ summary: "최근 게임 결과 조회" })
  @ApiOkResponse({
    description: "최근 게임 결과 조회 성공",
    type: LatestGameResultResponseDto,
    example: {
      gameId: "f2f796d1-5300-4b95-abf7-7761f5328d93",
      startedAt: "2026-05-13T04:00:00.000Z",
      endedAt: "2026-05-13T04:03:30.000Z",
      winner: "침착한치타3210",
      rankings: [
        {
          user_id: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
          game_id: "f2f796d1-5300-4b95-abf7-7761f5328d93",
          final_rank: 1,
          is_winner: true,
          is_survived: true,
          life: 3,
          wpm: 412.5,
          accuracy: 98.2,
          created_at: "2026-05-13T04:00:00.000Z",
          users: {
            nickname: "침착한치타3210",
            avatar_url: "https://cdn.example.com/avatars/cheetah-1.png",
          },
        },
      ],
    },
  })
  getLatestGameResult() {
    return this.gamesService.getLatestGameResult();
  }
}
