import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { AuthUserId } from "../../common/auth-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UpdateMyProfileInput } from "./dto/update-my-profile.dto";
// biome-ignore lint/style/useImportType: Swagger response schema metadata uses runtime class references.
import { UserDashboardResponseDto } from "./dto/user-dashboard-response.dto";
// biome-ignore lint/style/useImportType: Swagger response schema metadata uses runtime class references.
import { UserProfileResponseDto } from "./dto/user-profile-response.dto";
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
  @ApiOkResponse({
    description: "내 프로필 조회 성공",
    type: UserProfileResponseDto,
    example: {
      id: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
      nickname: "침착한치타3210",
      avatarUrl: "https://cdn.example.com/avatars/cheetah-1.png",
      createdAt: "2026-05-13T04:00:00.000Z",
    },
  })
  getMyProfile(@AuthUserId() userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  @ApiOperation({ summary: "내 프로필 수정" })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "내 프로필 수정 성공",
    type: UserProfileResponseDto,
    example: {
      id: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
      nickname: "침착한치타3210",
      avatarUrl: "https://cdn.example.com/avatars/cheetah-1.png",
      createdAt: "2026-05-13T04:00:00.000Z",
    },
  })
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
  @ApiOkResponse({
    description: "내 대시보드 조회 성공",
    type: UserDashboardResponseDto,
    example: {
      userId: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
      nickname: "민첩한여우5832",
      joinedAt: "2026-05-13T04:00:00.000Z",
      totalGames: 18,
      wins: 7,
      averageRank: 2.3,
      wpm: 376.4,
      averageWordCount: 193.6,
      totalWordCount: 3485,
    },
  })
  getMyDashboard(@AuthUserId() userId: string) {
    return this.usersService.getMyDashboard(userId);
  }

  @Get(":userId")
  @ApiOperation({ summary: "유저 프로필 조회" })
  @ApiParam({ name: "userId", description: "유저 UUID" })
  @ApiOkResponse({
    description: "유저 프로필 조회 성공",
    type: UserProfileResponseDto,
    example: {
      id: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
      nickname: "침착한치타3210",
      avatarUrl: "https://cdn.example.com/avatars/cheetah-1.png",
      createdAt: "2026-05-13T04:00:00.000Z",
    },
  })
  getUserProfile(@Param("userId") userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @Get(":userId/dashboard")
  @ApiOperation({ summary: "유저 대시보드 조회" })
  @ApiParam({ name: "userId", description: "유저 UUID" })
  @ApiOkResponse({
    description: "유저 대시보드 조회 성공",
    type: UserDashboardResponseDto,
    example: {
      userId: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
      nickname: "민첩한여우5832",
      joinedAt: "2026-05-13T04:00:00.000Z",
      totalGames: 18,
      wins: 7,
      averageRank: 2.3,
      wpm: 376.4,
      averageWordCount: 193.6,
      totalWordCount: 3485,
    },
  })
  getUserDashboard(@Param("userId") userId: string) {
    return this.usersService.getMyDashboard(userId);
  }
}
