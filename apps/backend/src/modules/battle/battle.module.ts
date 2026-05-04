import { Module } from "@nestjs/common";
import { BattleGateway } from "./gateways/battle.gateway";
import { BattleStateRepository } from "./repositories/battle-state.repository";
import { PromptRepository } from "./repositories/prompt.repository";
import { BattleService } from "./services/battle.service";
import { BattleBroadcastService } from "./services/battle-broadcast.service";
import { BattleCycleService } from "./services/battle-cycle.service";

@Module({
  providers: [
    BattleBroadcastService,
    BattleCycleService,
    BattleGateway,
    BattleService,
    BattleStateRepository,
    PromptRepository,
  ],
})
export class BattleModule {}
