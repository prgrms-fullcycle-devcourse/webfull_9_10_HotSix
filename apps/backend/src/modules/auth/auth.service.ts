import { Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "../users/users.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { AuthRepository } from "./auth.repository";
import type { CreateAnonymousUserDto } from "./dto/create-anonymous-user.dto";
import type { RefreshTokenDto } from "./dto/refresh-token.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
  ) {}

  createAnonymousUser(payload: CreateAnonymousUserDto = {}) {
    const user = this.usersService.createAnonymousUser(payload.preferredNickname);
    const session = this.authRepository.createSession(user.id);

    return {
      user,
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresIn: 3600,
      },
    };
  }

  refreshSession(payload: RefreshTokenDto) {
    const session = this.authRepository.findByRefreshToken(payload.refreshToken);

    if (!session) {
      throw new UnauthorizedException({
        code: "INVALID_REFRESH_TOKEN",
        message: "리프레시 토큰이 유효하지 않습니다.",
      });
    }

    const rotated = this.authRepository.createSession(session.userId, payload.refreshToken);
    const user = this.usersService.getMyProfile(session.userId);

    return {
      user,
      tokens: {
        accessToken: rotated.accessToken,
        refreshToken: rotated.refreshToken,
        expiresIn: 3600,
      },
    };
  }
}
