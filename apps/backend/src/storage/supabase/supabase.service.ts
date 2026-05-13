import { Injectable, InternalServerErrorException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { ConfigService } from "@nestjs/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient | null;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>("SUPABASE_URL");
    const key = this.configService.getOrThrow<string>("SUPABASE_SERVICE_ROLE_KEY");

    this.client = url && key ? createClient(url, key) : null;
  }
  get instance() {
    if (!this.client) {
      throw new InternalServerErrorException("Supabase client is not configured.");
    }

    return this.client;
  }

  get optionalInstance() {
    return this.client;
  }
}
