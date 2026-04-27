import { Global, Module } from "@nestjs/common";
import { GameStateService } from "./game-state.service";

@Global()
@Module({
  providers: [GameStateService],
  exports: [GameStateService],
})
export class GameStateModule {}
