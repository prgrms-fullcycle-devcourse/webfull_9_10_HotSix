import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validate } from "./config/env.config";
import { DocsModule } from "./docs/docs.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BattleModule } from "./modules/battle/battle.module";
import { GameStateModule } from "./modules/game-state/game-state.module";
import { GamesModule } from "./modules/games/games.module";
import { HealthModule } from "./modules/health/health.module";
import { MatchModule } from "./modules/match/match.module";
import { UsersModule } from "./modules/users/users.module";
import { StorageModule } from "./storage/storage.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
    }),
    GameStateModule,
    AuthModule,
    UsersModule,
    GamesModule,
    DocsModule,
    HealthModule,
    BattleModule,
    StorageModule,
    MatchModule,
  ],
})
export class AppModule {}
