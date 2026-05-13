import { Injectable, type OnModuleDestroy } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis(this.configService.get<string>("REDIS_URL", "redis://localhost:6379"), {
      lazyConnect: true,
    });
  }

  get instance() {
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client.status !== "end") {
      await this.client.quit();
    }
  }
}
