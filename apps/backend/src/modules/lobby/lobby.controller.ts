import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthUserId } from "../common/auth-user.decorator";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { LobbyService } from "./lobby.service";

@Controller("lobby")
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Post("join")
  @UseGuards(JwtAuthGuard)
  join(@AuthUserId() userId: string) {
    return this.lobbyService.join(userId);
  }
}
