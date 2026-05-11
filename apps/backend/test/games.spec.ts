import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { GamesController } from "../src/modules/games/games.controller";
import { GamesService } from "../src/modules/games/games.service";

const mockGamesService = {
  getCurrentGame: jest.fn(),
  getCurrentScoreboard: jest.fn(),
  getCurrentSpectators: jest.fn(),
  getLatestGameResult: jest.fn(),
};

describe("Games API", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  const getRequest = () => request(app.getHttpAdapter().getInstance());

  describe("GET /v1/games/current", () => {
    it("현재 게임 상태를 반환한다", async () => {
      const currentGame = {
        gameId: "game-123",
        phase: "waiting",
        startedAt: "2026-05-11T00:00:00.000Z",
      };
      mockGamesService.getCurrentGame.mockResolvedValue(currentGame);

      const response = await getRequest().get("/v1/games/current").expect(200);

      expect(mockGamesService.getCurrentGame).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(currentGame);
    });
  });

  describe("GET /v1/games/current/scoreboard", () => {
    it("현재 스코어보드를 반환한다", async () => {
      const scoreboard = {
        gameId: "game-123",
        players: [
          { userId: "user-1", nickname: "Jay", rank: 1, progress: 92 },
          { userId: "user-2", nickname: "Mia", rank: 2, progress: 81 },
        ],
      };
      mockGamesService.getCurrentScoreboard.mockResolvedValue(scoreboard);

      const response = await getRequest().get("/v1/games/current/scoreboard").expect(200);

      expect(mockGamesService.getCurrentScoreboard).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(scoreboard);
    });
  });

  describe("GET /v1/games/current/spectators", () => {
    it("현재 관전자 목록을 반환한다", async () => {
      const spectators = [
        {
          userId: "user-3",
          nickname: "Noah",
          avatarUrl: "https://example.com/noah.png",
        },
        {
          userId: "user-4",
          nickname: "Luna",
          avatarUrl: "https://example.com/luna.png",
        },
      ];
      mockGamesService.getCurrentSpectators.mockResolvedValue(spectators);

      const response = await getRequest().get("/v1/games/current/spectators").expect(200);

      expect(mockGamesService.getCurrentSpectators).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(spectators);
    });
  });

  describe("GET /v1/games/current/result", () => {
    it("가장 최근 게임 결과를 반환한다", async () => {
      const result = {
        gameId: "game-122",
        winnerUserId: "user-1",
        finishedAt: "2026-05-11T00:10:00.000Z",
      };
      mockGamesService.getLatestGameResult.mockResolvedValue(result);

      const response = await getRequest().get("/v1/games/current/result").expect(200);

      expect(mockGamesService.getLatestGameResult).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(result);
    });
  });
});
