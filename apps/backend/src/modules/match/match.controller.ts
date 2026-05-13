import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AuthUserId } from "../../common/auth-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
// biome-ignore lint/style/useImportType: Swagger response schema metadata uses runtime class references.
import { MatchJoinResponseDto } from "./dto/match-join-response.dto";
// biome-ignore lint/style/useImportType: Swagger response schema metadata uses runtime class references.
import { MatchPlayerDto } from "./dto/match-player.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { MatchService } from "./match.service";

@ApiTags("match")
@Controller("v1/match")
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post("join")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "매칭 참가" })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: "매칭 참가 성공",
    type: MatchJoinResponseDto,
  })
  join(@AuthUserId() userId: string) {
    return this.matchService.joinGame(userId);
  }

  @Get("users")
  @ApiOperation({ summary: "대기열 유저 목록 조회" })
  @ApiOkResponse({
    description: "대기열 유저 목록 조회 성공",
    type: MatchPlayerDto,
    isArray: true,
  })
  getAllUsers() {
    return this.matchService.getAllUsers();
  }
}
