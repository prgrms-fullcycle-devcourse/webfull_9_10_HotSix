import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { AuthUserId } from "../../common/auth-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UpdateMyProfileInput } from "./dto/update-my-profile.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("v1/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOperation({ summary: "내 프로필 조회" })
  @ApiBearerAuth()
  getMyProfile(@AuthUserId() userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  @ApiOperation({ summary: "내 프로필 수정" })
  @ApiBearerAuth()
  updateMyProfile(@AuthUserId() userId: string, @Body() input: UpdateMyProfileInput) {
    return this.usersService.updateMyProfile(userId, input);
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Delete("me")
  @ApiOperation({ summary: "내 프로필 삭제" })
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: "삭제 성공" })
  deleteUserDashboard(@AuthUserId() userId: string) {
    return this.usersService.deleteMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/dashboard")
  @ApiOperation({ summary: "내 대시보드 조회" })
  @ApiBearerAuth()
  getMyDashboard(@AuthUserId() userId: string) {
    return this.usersService.getMyDashboard(userId);
  }

  @Get(":userId")
  @ApiOperation({ summary: "유저 프로필 조회" })
  @ApiParam({ name: "userId", description: "유저 UUID" })
  getUserProfile(@Param("userId") userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @Get(":userId/dashboard")
  @ApiOperation({ summary: "유저 대시보드 조회" })
  @ApiParam({ name: "userId", description: "유저 UUID" })
  getUserDashboard(@Param("userId") userId: string) {
    return this.usersService.getMyDashboard(userId);
  }
}
