import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BattleModule } from "./modules/battle/battle.module";
import { HealthModule } from "./modules/health/health.module";
import { StorageModule } from "./modules/storage/storage.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    BattleModule,
    StorageModule,
  ],
})
export class AppModule {}
