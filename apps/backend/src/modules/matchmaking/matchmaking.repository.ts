import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { GameStateService } from "../game-state/game-state.service";

@Injectable()
export class MatchmakingRepository {
  constructor(private readonly gameStateService: GameStateService) {}

  findCurrentStatus(userId: string) {
    return this.gameStateService.getCurrentMatchStatus(userId);
  }

  joinCurrentMatch(userId: string, clientSessionId: string, preferredRole?: string) {
    return this.gameStateService.joinCurrentMatch(userId, clientSessionId, preferredRole);
  }
}
