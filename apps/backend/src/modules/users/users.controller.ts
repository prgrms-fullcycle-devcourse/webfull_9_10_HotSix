import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AuthUserId } from "../common/auth-user.decorator";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { CreateGuestUserInput } from "./dto/create-guest-user.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "./users.service";

@Controller("v1/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMyProfile(@AuthUserId() userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  updateMyProfile(@AuthUserId() userId: string, @Body() input: Partial<CreateGuestUserInput>) {
    return this.usersService.updateMyProfile(userId, input);
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Delete("me")
  deleteUserDashboard(@AuthUserId() userId: string) {
    return this.usersService.deleteMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/dashboard")
  getMyDashboard(@AuthUserId() userId: string) {
    return this.usersService.getMyDashboard(userId);
  }

  @Get(":userId")
  getUserProfile(@Param("userId") userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @Get(":userId/dashboard")
  getUserDashboard(@Param("userId") userId: string) {
    return this.usersService.getMyDashboard(userId);
  }
}
