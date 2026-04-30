import { Module } from "@nestjs/common";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";
import { UsersModule } from "../users/users.module";
import { LobbyController } from "./lobby.controller";
import { LobbyService } from "./lobby.service";

@Module({
  imports: [UsersModule],
  controllers: [LobbyController],
  providers: [LobbyService, JwtStrategy],
})
export class LobbyModule {}
