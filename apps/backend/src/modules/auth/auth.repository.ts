import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";

type SessionRecord = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

@Injectable()
export class AuthRepository {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly refreshIndex = new Map<string, SessionRecord>();

  createSession(userId: string, previousRefreshToken?: string) {
    if (previousRefreshToken) {
      this.refreshIndex.delete(previousRefreshToken);
    }

    const session = {
      accessToken: `atk_${randomUUID()}`,
      refreshToken: `rft_${randomUUID()}`,
      userId,
    };

    this.sessions.set(session.accessToken, session);
    this.refreshIndex.set(session.refreshToken, session);

    return session;
  }

  findByRefreshToken(refreshToken: string) {
    return this.refreshIndex.get(refreshToken) ?? null;
  }
}
