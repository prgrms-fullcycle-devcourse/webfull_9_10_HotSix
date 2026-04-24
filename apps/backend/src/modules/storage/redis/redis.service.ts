import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  get instance() {
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client.status !== "end") {
      await this.client.quit();
    }
  }
}
