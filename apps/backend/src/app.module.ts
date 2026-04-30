import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { BattleModule } from "./modules/battle/battle.module";
import { DocsModule } from "./modules/docs/docs.module";
import { GameStateModule } from "./modules/game-state/game-state.module";
import { GamesModule } from "./modules/games/games.module";
import { HealthModule } from "./modules/health/health.module";
import { LobbyModule } from "./modules/lobby/lobby.module";
import { MatchmakingModule } from "./modules/matchmaking/matchmaking.module";
import { StorageModule } from "./modules/storage/storage.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GameStateModule,
    AuthModule,
    UsersModule,
    MatchmakingModule,
    GamesModule,
    DocsModule,
    HealthModule,
    BattleModule,
    StorageModule,
    LobbyModule,
  ],
})
export class AppModule {}
