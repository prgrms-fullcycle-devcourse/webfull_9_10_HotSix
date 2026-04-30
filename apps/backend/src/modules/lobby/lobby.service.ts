import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { RedisService } from "../storage/redis/redis.service";

@Injectable()
export class LobbyService {
  constructor(private readonly redis: RedisService) {}

  async join(userId: string) {
    await this.redis.instance.sadd("lobby:players", userId);
    return {
      userId,
      socketNamespace: "/battle",
      socketAuthToken: `ws_tk_${randomUUID()}`,
    };
  }
}
