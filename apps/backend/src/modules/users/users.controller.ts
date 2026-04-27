import { Controller, Get } from "@nestjs/common";
import { AuthUserId } from "../common/auth-user.decorator";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "./users.service";

@Controller("v1/users/me")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getMyProfile(@AuthUserId() userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @Get("dashboard")
  getMyDashboard(@AuthUserId() userId: string) {
    return this.usersService.getMyDashboard(userId);
  }
}
