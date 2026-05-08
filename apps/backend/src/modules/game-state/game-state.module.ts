// biome-ignore assist/source/organizeImports: <explanation>
import { forwardRef, Global, Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { GameStateService } from "./game-state.service";
import { BattleModule } from "../battle/battle.module";
import { StorageModule } from "../../storage/storage.module";
import { MatchModule } from "../match/match.module";

@Global()
@Module({
  imports: [UsersModule, MatchModule, forwardRef(() => BattleModule), StorageModule],
  providers: [GameStateService],
  exports: [GameStateService],
})
export class GameStateModule {}
