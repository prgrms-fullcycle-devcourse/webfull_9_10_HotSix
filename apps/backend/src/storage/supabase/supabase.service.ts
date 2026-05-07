import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient | null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

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
