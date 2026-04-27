import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { GameStateService } from "../game-state/game-state.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly gameStateService: GameStateService) {}

  createAnonymousUser(preferredNickname?: string) {
    return this.gameStateService.createAnonymousUser(preferredNickname);
  }

  findById(userId: string) {
    return this.gameStateService.getUserById(userId);
  }

  findDashboardByUserId(userId: string) {
    return this.gameStateService.getDashboard(userId);
  }
}
