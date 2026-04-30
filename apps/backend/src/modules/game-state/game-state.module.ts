import { Global, Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { GameStateService } from "./game-state.service";

@Global()
@Module({
  imports: [UsersModule],
  providers: [GameStateService],
  exports: [GameStateService],
})
export class GameStateModule {}
