import { Global, Module } from "@nestjs/common";
import { RedisService } from "./redis/redis.service";
import { SupabaseService } from "./supabase/supabase.service";

@Global()
@Module({
  providers: [RedisService, SupabaseService],
  exports: [RedisService, SupabaseService],
})
export class StorageModule {}
