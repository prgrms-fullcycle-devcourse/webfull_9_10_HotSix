// biome-ignore assist/source/organizeImports: <explanation>
import { forwardRef, Global, Module } from "@nestjs/common";
import { MatchService } from "../match/match.service";
import { RedisService } from "../storage/redis/redis.service";
import { SupabaseService } from "../storage/supabase/supabase.service";
import { UsersModule } from "../users/users.module";
import { GameStateService } from "./game-state.service";
import { BattleModule } from "../battle/battle.module";

@Global()
@Module({
  imports: [UsersModule, forwardRef(() => BattleModule)],
  providers: [GameStateService, MatchService, SupabaseService, RedisService],
  exports: [GameStateService],
})
export class GameStateModule {}
