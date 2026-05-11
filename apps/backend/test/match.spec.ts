import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  UnauthorizedException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { JwtAuthGuard } from "../src/modules/auth/guards/jwt-auth.guard";
import { MatchController } from "../src/modules/match/match.controller";
import { MatchService } from "../src/modules/match/match.service";

const mockMatchService = {
  joinGame: jest.fn(),
  getAllUsers: jest.fn(),
};

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = {
      id: "auth-user-123",
    };
    return true;
  }
}

class RejectJwtAuthGuard implements CanActivate {
  canActivate(_: ExecutionContext): boolean {
    throw new UnauthorizedException();
  }
}

describe("Match API", () => {
  let app: INestApplication;
  let unauthorizedApp: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        {
          provide: MatchService,
          useValue: mockMatchService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const unauthorizedModuleRef = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        {
          provide: MatchService,
          useValue: mockMatchService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(RejectJwtAuthGuard)
      .compile();

    unauthorizedApp = unauthorizedModuleRef.createNestApplication();
    await unauthorizedApp.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await unauthorizedApp.close();
  });

  const getRequest = () => request(app.getHttpAdapter().getInstance());
  const getUnauthorizedRequest = () => request(unauthorizedApp.getHttpAdapter().getInstance());

  describe("POST /v1/match/join", () => {
    it("인증된 사용자를 매치에 참여시킨다", async () => {
      const payload = {
        userId: "auth-user-123",
        role: "player",
        status: "waiting",
        socketNamespace: "/battle",
        socketAuthToken: "ws_tk_test-token",
      };
      mockMatchService.joinGame.mockResolvedValue(payload);

      const response = await getRequest().post("/v1/match/join").expect(201);

      expect(mockMatchService.joinGame).toHaveBeenCalledTimes(1);
      expect(mockMatchService.joinGame).toHaveBeenCalledWith("auth-user-123");
      expect(response.body).toEqual(payload);
    });

    it("인증되지 않은 요청이면 401을 반환한다", async () => {
      await getUnauthorizedRequest().post("/v1/match/join").expect(401);

      expect(mockMatchService.joinGame).not.toHaveBeenCalled();
    });
  });

  describe("GET /v1/match/users", () => {
    it("대기실 유저 목록을 반환한다", async () => {
      const players = [
        {
          userId: "user-1",
          nickname: "Jay",
          avatarUrl: "https://example.com/jay.png",
          status: "waiting",
          role: "player",
          joinedAt: "2026-05-11T00:00:00.000Z",
        },
        {
          userId: "user-2",
          nickname: "Mia",
          avatarUrl: "https://example.com/mia.png",
          status: "spectating",
          role: "spectator",
          joinedAt: "2026-05-11T00:01:00.000Z",
        },
      ];
      mockMatchService.getAllUsers.mockResolvedValue(players);

      const response = await getRequest().get("/v1/match/users").expect(200);

      expect(mockMatchService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual(players);
    });
  });
});
