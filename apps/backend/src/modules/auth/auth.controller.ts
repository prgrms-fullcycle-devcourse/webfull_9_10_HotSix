import { Controller, HttpCode, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { AuthService } from "./auth.service";

const REFRESH_TOKEN_COOKIE = "refreshToken";

type RequestWithCookies = Request & {
  cookies?: Record<string, string | undefined>;
};

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("guest/login")
  async loginGuest(@Res({ passthrough: true }) response: Response) {
    const session = await this.authService.loginGuest();

    this.setRefreshTokenCookie(
      response,
      session.refreshToken,
      new Date(session.refreshTokenExpiresAt),
    );

    return {
      user: session.user,
      tokens: session.tokens,
    };
  }

  @Post("refresh")
  async refreshSession(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException({
        code: "AUTHENTICATION_REQUIRED",
        message: "리프레시 토큰 쿠키가 없습니다.",
      });
    }

    const session = await this.authService.refreshSession(refreshToken);

    this.setRefreshTokenCookie(
      response,
      session.refreshToken,
      new Date(session.refreshTokenExpiresAt),
    );

    return {
      user: session.user,
      tokens: session.tokens,
    };
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Req() request: RequestWithCookies, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];

    await this.authService.logout(refreshToken);
    this.clearRefreshTokenCookie(response);
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string, expiresAt: Date) {
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
      expires: expiresAt,
    });
  }

  private clearRefreshTokenCookie(response: Response) {
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    });
  }
}
