// biome-ignore assist/source/organizeImports: <explanation>
import { forwardRef, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";
import { UsersModule } from "../users/users.module";
import { MatchController } from "./match.controller";
import { MatchService } from "./match.service";
import { BattleModule } from "../battle/battle.module";

@Module({
  imports: [UsersModule, PassportModule, forwardRef(() => BattleModule)],
  controllers: [MatchController],
  providers: [MatchService, JwtStrategy],
  exports: [MatchService],
})
export class MatchModule {}
