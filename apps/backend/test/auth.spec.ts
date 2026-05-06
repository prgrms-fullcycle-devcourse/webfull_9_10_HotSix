import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AuthController } from "../src/modules/auth/auth.controller";
import { AuthService } from "../src/modules/auth/auth.service";

const mockAuthService = {
  loginGuest: jest.fn(),
  refreshSession: jest.fn(),
  logout: jest.fn(),
};

function createMockSession() {
  return {
    user: {
      id: "user-123",
      nickname: "guest-user",
      avatarUrl: "https://example.com/avatar.png",
      createdAt: "2026-05-05T12:00:00.000Z",
    },
    tokens: {
      tokenType: "Bearer" as const,
      accessToken: "access-token-123",
      expiresIn: 900,
      accessTokenExpiresAt: "2026-05-05T12:15:00.000Z",
    },
    refreshToken: "refresh-token-123",
    refreshTokenExpiresAt: "2026-06-04T12:00:00.000Z",
  };
}

describe("Auth API", () => {
  let app: INestApplication;
  let previousCookieSecure: string | undefined;
  let previousCookieDomain: string | undefined;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(() => {
    previousCookieSecure = process.env.COOKIE_SECURE;
    previousCookieDomain = process.env.COOKIE_DOMAIN;

    jest.clearAllMocks();
    delete process.env.COOKIE_SECURE;
    delete process.env.COOKIE_DOMAIN;
  });

  afterEach(() => {
    if (previousCookieSecure === undefined) {
      delete process.env.COOKIE_SECURE;
    } else {
      process.env.COOKIE_SECURE = previousCookieSecure;
    }

    if (previousCookieDomain === undefined) {
      delete process.env.COOKIE_DOMAIN;
    } else {
      process.env.COOKIE_DOMAIN = previousCookieDomain;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /v1/auth/guest/login", () => {
    it("게스트 로그인에 성공하면 user, tokens, refreshToken 쿠키를 반환한다", async () => {
      const session = createMockSession();
      mockAuthService.loginGuest.mockResolvedValue(session);

      const response = await request(app.getHttpServer()).post("/v1/auth/guest/login").expect(201);

      expect(mockAuthService.loginGuest).toHaveBeenCalledTimes(1);

      expect(response.body).toEqual({
        user: session.user,
        tokens: session.tokens,
      });

      const setCookie = response.headers["set-cookie"];

      expect(setCookie).toBeDefined();

      if (!setCookie) {
        throw new Error("set-cookie header is missing");
      }

      expect(setCookie[0]).toContain("refreshToken=refresh-token-123");
      expect(setCookie[0]).toContain("HttpOnly");
      expect(setCookie[0]).toContain("Path=/");
      expect(setCookie[0]).toContain("SameSite=Lax");
    });
  });

  describe("POST /v1/auth/refresh", () => {
    it("refreshToken 쿠키가 없으면 401을 반환한다", async () => {
      const response = await request(app.getHttpServer()).post("/v1/auth/refresh").expect(401);

      expect(mockAuthService.refreshSession).not.toHaveBeenCalled();
      expect(response.body.code).toBe("AUTHENTICATION_REQUIRED");
      expect(response.body.message).toBe("리프레시 토큰 쿠키가 없습니다.");
    });

    it("refreshToken 쿠카가 있으면 세션을 갱신하고 새 쿠키를 반환한다", async () => {
      const session = createMockSession();
      session.tokens.accessToken = "new-access-token-456";
      session.refreshToken = "new-refresh-token-456";

      mockAuthService.refreshSession.mockResolvedValue(session);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/refresh")
        .set("Cookie", ["refreshToken=old-refresh-token-123"])
        .expect(201);

      expect(mockAuthService.refreshSession).toHaveBeenCalledTimes(1);
      expect(mockAuthService.refreshSession).toHaveBeenCalledWith("old-refresh-token-123");

      expect(response.body).toEqual({
        user: session.user,
        tokens: session.tokens,
      });

      const setCookie = response.headers["set-cookie"];

      expect(setCookie).toBeDefined();

      if (!setCookie) {
        throw new Error("set-cookie header is missing");
      }

      expect(setCookie[0]).toContain("refreshToken=new-refresh-token-456");
      expect(setCookie[0]).toContain("HttpOnly");
      expect(setCookie[0]).toContain("Path=/");
      expect(setCookie[0]).toContain("SameSite=Lax");
    });
  });

  describe("POST /v1/auth/logout", () => {
    it("refreshToken 쿠키가 있으면 로그아웃하고 쿠키를 삭제한다", async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/logout")
        .set("Cookie", ["refreshToken=logout-token-123"])
        .expect(204);

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
      expect(mockAuthService.logout).toHaveBeenCalledWith("logout-token-123");
      expect(response.text).toBe("");

      const setCookie = response.headers["set-cookie"];

      expect(setCookie).toBeDefined();

      if (!setCookie) {
        throw new Error("set-cookie header is missing");
      }

      expect(setCookie[0]).toContain("refreshToken=");
      expect(setCookie[0]).toContain("Path=/");
    });

    it("refreshToken 쿠키가 없어도 204를 반환한다", async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await request(app.getHttpServer()).post("/v1/auth/logout").expect(204);

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
      expect(mockAuthService.logout).toHaveBeenCalledWith(undefined);
    });
  });
});
