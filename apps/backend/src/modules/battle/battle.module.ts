import { Module } from "@nestjs/common";
import { BattleGateway } from "./gateways/battle.gateway";
import { BattleService } from "./services/battle.service";

@Module({
  providers: [BattleGateway, BattleService],
})
export class BattleModule {}
