import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthUserId } from "../common/auth-user.decorator";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { MatchService } from "./match.service";

@Controller("v1/match")
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post("join")
  @UseGuards(JwtAuthGuard)
  join(@AuthUserId() userId: string) {
    return this.matchService.joinGame(userId);
  }

  @Get("users")
  getAllUsers() {
    return this.matchService.getAllUsers();
  }
}
