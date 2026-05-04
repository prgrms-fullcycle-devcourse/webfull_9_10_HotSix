import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";
import { UsersModule } from "../users/users.module";
import { MatchController } from "./match.controller";
import { MatchService } from "./match.service";

@Module({
  imports: [UsersModule, PassportModule],
  controllers: [MatchController],
  providers: [MatchService, JwtStrategy],
  exports: [MatchService],
})
export class MatchModule {}
