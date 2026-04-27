import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getMyProfile(userId: string) {
    return this.usersRepository.findById(userId);
  }

  getMyDashboard(userId: string) {
    return this.usersRepository.findDashboardByUserId(userId);
  }

  createAnonymousUser(preferredNickname?: string) {
    return this.usersRepository.createAnonymousUser(preferredNickname);
  }
}
