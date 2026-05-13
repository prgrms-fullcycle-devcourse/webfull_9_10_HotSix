import { createHash, randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { ConfigService } from "@nestjs/config";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { JwtService } from "@nestjs/jwt";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "../users/users.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { AuthRepository } from "./auth.repository";

type AuthSessionResult = {
  user: {
    id: string;
    nickname: string;
    avatarUrl: string;
    createdAt: string;
  };
  tokens: {
    tokenType: "Bearer";
    accessToken: string;
    expiresIn: number;
    accessTokenExpiresAt: string;
  };
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginGuest(): Promise<AuthSessionResult> {
    const user = await this.usersService.createGuestUser();
    const refreshToken = this.createRefreshToken();
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshTokenExpiresAt = this.buildRefreshTokenExpiry();

    await this.authRepository.createRefreshTokenSession({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    const accessToken = await this.signAccessToken(user.id);
    const accessTokenExpiresAt = this.buildAccessTokenExpiry();

    return {
      user,
      tokens: {
        tokenType: "Bearer",
        accessToken,
        expiresIn: this.getAccessTokenTtlSeconds(),
        accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      },
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
    };
  }

  async refreshSession(refreshToken: string): Promise<AuthSessionResult> {
    const refreshTokenHash = this.hashToken(refreshToken);
    const session = await this.authRepository.findRefreshTokenByHash(refreshTokenHash);

    if (!session) {
      throw new UnauthorizedException({
        code: "INVALID_REFRESH_TOKEN",
        message: "리프레스 토큰이 유효하지 않습니다.",
      });
    }

    if (session.revoked_at) {
      throw new UnauthorizedException({
        code: "REFRESH_TOKEN_REVOKED",
        message: "이미 폐기된 리프레시 토큰입니다.",
      });
    }

    if (new Date(session.expires_at).getTime() <= Date.now()) {
      throw new UnauthorizedException({
        code: "REFRESH_TOKEN_EXPIRED",
        message: "만료된 리프레시 토큰입니다.",
      });
    }

    const user = await this.usersService.getMyProfile(session.user_id);
    const nextRefreshToken = this.createRefreshToken();
    const nextRefreshTokenHash = this.hashToken(nextRefreshToken);
    const nextRefreshTokenExpiresAt = this.buildRefreshTokenExpiry();

    await this.authRepository.revokeRefreshToken(session.id, new Date());
    await this.authRepository.createRefreshTokenSession({
      userId: session.user_id,
      tokenHash: nextRefreshTokenHash,
      expiresAt: nextRefreshTokenExpiresAt,
    });

    const accessToken = await this.signAccessToken(user.id);
    const accessTokenExpiresAt = this.buildAccessTokenExpiry();

    return {
      user,
      tokens: {
        tokenType: "Bearer",
        accessToken,
        expiresIn: this.getAccessTokenTtlSeconds(),
        accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      },
      refreshToken: nextRefreshToken,
      refreshTokenExpiresAt: nextRefreshTokenExpiresAt.toISOString(),
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    const refreshTokenHash = this.hashToken(refreshToken);
    const session = await this.authRepository.findRefreshTokenByHash(refreshTokenHash);

    if (!session || session.revoked_at) {
      return;
    }

    await this.authRepository.revokeRefreshToken(session.id, new Date());
  }

  private async signAccessToken(userId: string) {
    const secret = this.configService.getOrThrow<string>("JWT_SECRET");

    if (!secret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    return this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        secret,
        expiresIn: this.getAccessTokenTtlSeconds(),
      },
    );
  }

  private createRefreshToken() {
    return `rft_${randomBytes(48).toString("base64url")}`;
  }

  private hashToken(rawToken: string) {
    return createHash("sha256").update(rawToken).digest("hex");
  }

  private getAccessTokenTtlSeconds() {
    return this.configService.get<number>("ACCESS_TOKEN_TTL_SECONDS", 900);
  }

  private getRefreshTokenTtlDays() {
    return this.configService.get<number>("REFRESH_TOKEN_TTL_DAYS", 30);
  }

  private buildAccessTokenExpiry() {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.getAccessTokenTtlSeconds());
    return expiresAt;
  }

  private buildRefreshTokenExpiry() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.getRefreshTokenTtlDays());
    return expiresAt;
  }
}
