import { Module } from "@nestjs/common";
import { MatchmakingController } from "./matchmaking.controller";
import { MatchmakingRepository } from "./matchmaking.repository";
import { MatchmakingService } from "./matchmaking.service";

@Module({
  controllers: [MatchmakingController],
  providers: [MatchmakingService, MatchmakingRepository],
})
export class MatchmakingModule {}
