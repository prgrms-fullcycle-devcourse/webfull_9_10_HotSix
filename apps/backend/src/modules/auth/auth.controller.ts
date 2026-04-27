import { Body, Controller, Post } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { AuthService } from "./auth.service";
import type { CreateAnonymousUserDto } from "./dto/create-anonymous-user.dto";
import type { RefreshTokenDto } from "./dto/refresh-token.dto";

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("anonymous")
  createAnonymousUser(@Body() payload: CreateAnonymousUserDto) {
    return this.authService.createAnonymousUser(payload);
  }

  @Post("refresh")
  refreshSession(@Body() payload: RefreshTokenDto) {
    return this.authService.refreshSession(payload);
  }
}
