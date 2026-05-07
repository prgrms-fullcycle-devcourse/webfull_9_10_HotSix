import { Global, Module } from "@nestjs/common";
import { MatchService } from "../match/match.service";
import { UsersModule } from "../users/users.module";
import { GameStateService } from "./game-state.service";

@Global()
@Module({
  imports: [UsersModule],
  providers: [GameStateService, MatchService],
  exports: [GameStateService],
})
export class GameStateModule {}
