import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { MatchmakingRepository } from "./matchmaking.repository";

@Injectable()
export class MatchmakingService {
  constructor(private readonly matchmakingRepository: MatchmakingRepository) {}

  getCurrentMatchStatus(userId: string) {
    return this.matchmakingRepository.findCurrentStatus(userId);
  }

  joinCurrentMatch(userId: string, clientSessionId: string, preferredRole?: string) {
    return this.matchmakingRepository.joinCurrentMatch(userId, clientSessionId, preferredRole);
  }
}
