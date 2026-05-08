import { forwardRef, Module } from "@nestjs/common";
import { GameStateModule } from "../game-state/game-state.module";
import { BattleGateway } from "./gateways/battle.gateway";
import { BattleStateRepository } from "./repositories/battle-state.repository";
import { PromptRepository } from "./repositories/prompt.repository";
import { BattleService } from "./services/battle.service";
import { BattleBroadcastService } from "./services/battle-broadcast.service";
import { BattleCycleService } from "./services/battle-cycle.service";

@Module({
  imports: [forwardRef(() => GameStateModule)],
  providers: [
    BattleBroadcastService,
    BattleCycleService,
    BattleGateway,
    BattleService,
    BattleStateRepository,
    PromptRepository,
  ],
  exports: [BattleService],
})
export class BattleModule {}
