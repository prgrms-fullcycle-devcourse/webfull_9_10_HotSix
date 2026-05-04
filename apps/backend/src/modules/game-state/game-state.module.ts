import { Global, Module } from "@nestjs/common";
import { MatchService } from "../match/match.service";
import { RedisService } from "../storage/redis/redis.service";
import { SupabaseService } from "../storage/supabase/supabase.service";
import { UsersModule } from "../users/users.module";
import { GameStateService } from "./game-state.service";

@Global()
@Module({
  imports: [UsersModule],
  providers: [GameStateService, MatchService, SupabaseService, RedisService],
  exports: [GameStateService],
})
export class GameStateModule {}
