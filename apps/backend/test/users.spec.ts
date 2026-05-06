import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { JwtAuthGuard } from "../src/modules/auth/guards/jwt-auth.guard";
import { UsersController } from "../src/modules/users/users.controller";
import { UsersService } from "../src/modules/users/users.service";

const mockUsersService = {
  getMyProfile: jest.fn(),
  getMyDashboard: jest.fn(),
  updateMyProfile: jest.fn(),
  deleteMyProfile: jest.fn(),
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

function createMockUser() {
  return {
    id: "user-123",
    nickname: "guest-user",
    avatarUrl: "https://example.com/avatar.png",
    createdAt: "2026-05-06T12:00:00.000Z",
  };
}

function createMockDashboard() {
  return {
    totalMatches: 12,
    totalWins: 7,
    rating: 1540,
    recentResults: ["win", "lose", "win"],
  };
}

describe("Users API", () => {
  let app: INestApplication;
  let unauthorizedApp: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const unauthorizedModuleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(RejectJwtAuthGuard)
      .compile();

    unauthorizedApp = unauthorizedModuleRef.createNestApplication();
    unauthorizedApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await unauthorizedApp.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
    await unauthorizedApp.close();
  });

  describe("GET /v1/users/me", () => {
    it("인증된 사용자의 프로필을 반환한다", async () => {
      const user = createMockUser();
      mockUsersService.getMyProfile.mockResolvedValue(user);

      const response = await request(app.getHttpServer()).get("/v1/users/me").expect(200);

      expect(mockUsersService.getMyProfile).toHaveBeenCalledTimes(1);
      expect(mockUsersService.getMyProfile).toHaveBeenCalledWith("auth-user-123");
      expect(response.body).toEqual(user);
    });
  });

  describe("PATCH /v1/users/me", () => {
    it("인증된 사용자의 프로필을 수정한다", async () => {
      const updatedUser = createMockUser();
      updatedUser.nickname = "updated-user";

      const input = {
        nickname: "updated-user",
      };

      mockUsersService.updateMyProfile.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .patch("/v1/users/me")
        .send(input)
        .expect(200);

      expect(mockUsersService.updateMyProfile).toHaveBeenCalledTimes(1);
      expect(mockUsersService.updateMyProfile).toHaveBeenCalledWith("auth-user-123", input);
      expect(response.body).toEqual(updatedUser);
    });

    it("nickname이 너무 짧으면 400을 반환한다", async () => {
      const response = await request(app.getHttpServer())
        .patch("/v1/users/me")
        .send({
          nickname: "a",
        })
        .expect(400);

      expect(mockUsersService.updateMyProfile).not.toHaveBeenCalled();
      expect(response.body.message).toContain(
        "nickname must be longer than or equal to 2 characters",
      );
    });

    it("avatarUrl이 URL 형식이 아니면 400을 반환한다", async () => {
      const response = await request(app.getHttpServer())
        .patch("/v1/users/me")
        .send({
          avatarUrl: "not-a-url",
        })
        .expect(400);

      expect(mockUsersService.updateMyProfile).not.toHaveBeenCalled();
      expect(response.body.message).toContain("avatarUrl must be a URL address");
    });

    it("nickname이 20자를 초과하면 400을 반환한다", async () => {
      const response = await request(app.getHttpServer())
        .patch("/v1/users/me")
        .send({
          nickname: "this-nickname-is-way-too-long",
        })
        .expect(400);

      expect(mockUsersService.updateMyProfile).not.toHaveBeenCalled();
      expect(response.body.message).toContain(
        "nickname must be shorter than or equal to 20 characters",
      );
    });

    it("허용되지 않은 필드가 들어오면 400을 반환한다", async () => {
      const response = await request(app.getHttpServer())
        .patch("/v1/users/me")
        .send({
          nickname: "valid-name",
          role: "admin",
        })
        .expect(400);

      expect(mockUsersService.updateMyProfile).not.toHaveBeenCalled();
      expect(response.body.message).toContain("property role should not exist");
    });

    it("수정할 필드가 없으면 400을 반환한다", async () => {
      mockUsersService.updateMyProfile.mockRejectedValue(
        new BadRequestException("수정할 항목이 없습니다."),
      );

      const response = await request(app.getHttpServer())
        .patch("/v1/users/me")
        .send({})
        .expect(400);

      expect(mockUsersService.updateMyProfile).toHaveBeenCalledTimes(1);
      expect(mockUsersService.updateMyProfile).toHaveBeenCalledWith("auth-user-123", {});
      expect(response.body.message).toBe("수정할 항목이 없습니다.");
    });
  });

  describe("DELETE /v1/users/me", () => {
    it("인증된 사용자의 프로필을 삭제한다", async () => {
      mockUsersService.deleteMyProfile.mockResolvedValue(undefined);

      const respones = await request(app.getHttpServer()).delete("/v1/users/me").expect(204);

      expect(mockUsersService.deleteMyProfile).toHaveBeenCalledTimes(1);
      expect(mockUsersService.deleteMyProfile).toHaveBeenCalledWith("auth-user-123");
      expect(respones.text).toBe("");
    });
  });

  describe("GET /v1/users/me/dashboard", () => {
    it("인증된 사용자의 대시보드를 반환한다", async () => {
      const dashboard = createMockDashboard();
      mockUsersService.getMyDashboard.mockResolvedValue(dashboard);

      const response = await request(app.getHttpServer()).get("/v1/users/me/dashboard").expect(200);

      expect(mockUsersService.getMyDashboard).toHaveBeenCalledTimes(1);
      expect(mockUsersService.getMyDashboard).toHaveBeenCalledWith("auth-user-123");
      expect(response.body).toEqual(dashboard);
    });
  });

  describe("GET /v1/users/:userId", () => {
    it("특정 사용자의 프로필을 반환한다", async () => {
      const user = createMockUser();
      mockUsersService.getMyProfile.mockResolvedValue(user);

      const response = await request(app.getHttpServer()).get("/v1/users/user-999").expect(200);

      expect(mockUsersService.getMyProfile).toHaveBeenCalledTimes(1);
      expect(mockUsersService.getMyProfile).toHaveBeenCalledWith("user-999");
      expect(response.body).toEqual(user);
    });
  });

  describe("GET /v1/users/:userId/dashboard", () => {
    it("특정 사용자의 대시보드를 반환한다", async () => {
      const dashboard = createMockDashboard();
      mockUsersService.getMyDashboard.mockResolvedValue(dashboard);

      const response = await request(app.getHttpServer())
        .get("/v1/users/user-999/dashboard")
        .expect(200);

      expect(mockUsersService.getMyDashboard).toHaveBeenCalledTimes(1);
      expect(mockUsersService.getMyDashboard).toHaveBeenCalledWith("user-999");
      expect(response.body).toEqual(dashboard);
    });
  });

  describe("인증 실패", () => {
    it("GET /v1/users/me 요청이 인증되지 않으면 401을 반환한다", async () => {
      await request(unauthorizedApp.getHttpServer()).get("/v1/users/me").expect(401);

      expect(mockUsersService.getMyProfile).not.toHaveBeenCalled();
    });

    it("PATCH /v1/users/me 요청이 인증되지 않으면 401을 반환한다", async () => {
      await request(unauthorizedApp.getHttpServer())
        .patch("/v1/users/me")
        .send({
          nickname: "updated-user",
        })
        .expect(401);

      expect(mockUsersService.updateMyProfile).not.toHaveBeenCalled();
    });

    it("DELETE /v1/users/me 요청이 인증되지 않으면 401을 반환한다", async () => {
      await request(unauthorizedApp.getHttpServer()).delete("/v1/users/me").expect(401);

      expect(mockUsersService.deleteMyProfile).not.toHaveBeenCalled();
    });
  });
});
