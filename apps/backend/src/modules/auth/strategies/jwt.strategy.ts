import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "",
    });
  }

  async validate(payload: { sub: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.getMyProfile(payload.sub);

    if (!user) {
      throw new UnauthorizedException({
        code: "USER_NOT_FOUND",
        message: "존재하지 않는 유저입니다.",
      });
    }
    // req.user에 들어갈 값
    return { id: user.id, nickname: user.nickname };
  }
}
