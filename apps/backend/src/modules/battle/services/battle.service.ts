import { Injectable } from "@nestjs/common";
import type { BattleReadyDto } from "../dto/battle-ready.dto";

@Injectable()
export class BattleService {
  getWelcomeMessage() {
    return {
      message: "Keyboard Warrior Battle Royale server connected",
    };
  }

  createReadyConfirmation(payload: BattleReadyDto) {
    return {
      nickname: payload.nickname,
      status: "queued" as const,
    };
  }
}
