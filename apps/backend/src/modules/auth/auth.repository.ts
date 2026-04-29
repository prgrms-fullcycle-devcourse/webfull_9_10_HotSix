import { Injectable, InternalServerErrorException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { SupabaseService } from "../storage/supabase/supabase.service";

type RefreshTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
};

type CreateRefreshTokenSessionInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createRefreshTokenSession(input: CreateRefreshTokenSessionInput) {
    const { data, error } = await this.supabaseService.instance
      .from("refresh_tokens")
      .insert({
        user_id: input.userId,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt.toISOString(),
      })
      .select()
      .single<RefreshTokenRow>();

    if (error || !data) {
      throw new InternalServerErrorException("리프레스 토큰 세션 생성에 실패했습니다.");
    }

    return data;
  }

  async findRefreshTokenByHash(tokenHash: string) {
    const { data, error } = await this.supabaseService.instance
      .from("refresh_tokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle<RefreshTokenRow>();

    if (error) {
      throw new InternalServerErrorException("리프레시 토큰 조회에 실패했습니다.");
    }

    return data;
  }

  async revokeRefreshToken(sessionId: string, revokedAt: Date) {
    const { error } = await this.supabaseService.instance
      .from("refresh_tokens")
      .update({
        revoked_at: revokedAt.toISOString(),
      })
      .eq("id", sessionId)
      .is("revoked_at", null);

    if (error) {
      throw new InternalServerErrorException("리프레시 토큰 폐기에 실패했습니다.");
    }
  }
}
