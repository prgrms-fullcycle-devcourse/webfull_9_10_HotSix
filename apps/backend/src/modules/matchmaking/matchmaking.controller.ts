import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthUserId } from "../common/auth-user.decorator";
import type { JoinMatchDto } from "./dto/join-match.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { MatchmakingService } from "./matchmaking.service";

@Controller("v1/matchmaking")
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Get("status")
  getCurrentMatchStatus(@AuthUserId() userId: string) {
    return this.matchmakingService.getCurrentMatchStatus(userId);
  }

  @Post("join")
  joinCurrentMatch(@AuthUserId() userId: string, @Body() payload: JoinMatchDto) {
    return this.matchmakingService.joinCurrentMatch(
      userId,
      payload.clientSessionId,
      payload.preferredRole,
    );
  }
}
