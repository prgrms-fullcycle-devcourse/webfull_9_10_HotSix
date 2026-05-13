import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisService } from "./redis/redis.service";
import { SupabaseService } from "./supabase/supabase.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService, SupabaseService],
  exports: [RedisService, SupabaseService],
})
export class StorageModule {}
