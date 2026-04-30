import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "../users/users.service";

type UserProfile = {
  id: string;
  nickname: string;
  avatarUrl: string;
  createdAt: string;
};

@Injectable()
export class GameStateService {
  private readonly users = new Map<string, UserProfile>();

  constructor(private usersService: UsersService) {
    const seededUsers: UserProfile[] = [
      this.buildUser("demo-user-1", "폭주하는타자왕", "https://cdn.example.com/avatars/fox-1.png"),
      this.buildUser(
        "demo-user-2",
        "침착한고슴도치",
        "https://cdn.example.com/avatars/hedgehog-1.png",
      ),
      this.buildUser(
        "demo-user-3",
        "도약하는치타",
        "https://cdn.example.com/avatars/cheetah-1.png",
      ),
      this.buildUser("demo-user-4", "질주하는매", "https://cdn.example.com/avatars/hawk-1.png"),
      this.buildUser("demo-user-5", "분석하는올빼미", "https://cdn.example.com/avatars/owl-1.png"),
    ];

    for (const user of seededUsers) {
      this.users.set(user.id, user);
    }
  }

  createAnonymousUser(preferredNickname?: string) {
    const user = this.buildUser(
      randomUUID(),
      this.buildNickname(preferredNickname),
      this.buildAvatarUrl(),
    );

    this.users.set(user.id, user);

    return user;
  }

  async getDashboard(userId: string) {
    const user = await this.usersService.getMyProfile(userId);

    return {
      userId: user.id,
      nickname: user.nickname,
      joinedAt: user.createdAt,
      totalGames: 42,
      wins: 8,
      averageRank: 3.4,
      recentRank: 2,
      bestRank: 1,
      averageWpm: 312,
      averageAccuracy: 97,
    };
  }

  async getCurrentMatchStatus(userId: string) {
    const user = await this.usersService.getMyDashboard(userId);
    const dashboard = await this.usersService.getMyDashboard(userId);

    return {
      match: {
        gameId: 104,
        phase: "waiting",
        minPlayers: 4,
        waitingPlayerCount: 6,
        playerCount: 6,
        spectatorCount: 3,
        eliminatedCount: 0,
        startsAt: "2026-04-27T10:05:00Z",
        startedAt: null,
        endsAt: null,
        serverTime: "2026-04-27T10:04:42Z",
      },
      waitingRoom: {
        title: "다음 라운드 대기실",
        ruleSummary: [
          "오타가 나는 즉시 탈락합니다.",
          "가장 먼저 장문을 완성하면 우승합니다.",
          "생존자가 1명만 남아도 즉시 종료됩니다.",
        ],
        countdownSeconds: 18,
      },
      me: {
        userId: user.userId,
        nickname: user.nickname,
        role: "player",
        status: "waiting",
        hasActiveSession: true,
      },
    };
  }

  async joinCurrentMatch(userId: string, clientSessionId: string, preferredRole?: string) {
    const user = await this.usersService.getMyDashboard(userId);
    const assignedRole = preferredRole === "spectator" ? "spectator" : "player";
    const assignedStatus = assignedRole === "spectator" ? "spectating" : "waiting";

    return {
      gameId: 104,
      assignedRole,
      assignedStatus,
      socketNamespace: "/battle",
      socketAuthToken: `ws_tk_${clientSessionId}`,
      reason: null,
      user,
    };
  }

  getCurrentGame() {
    return {
      game: {
        id: 104,
        phase: "in_progress",
        minPlayers: 4,
        totalPlayers: 6,
        spectatorCount: 3,
        winnerUserId: null,
      },
      prompt: {
        id: 7,
        text: "빠른 갈색 여우가 게으른 개를 뛰어넘는다.",
        totalLength: 27,
      },
      participants: this.getParticipants(),
    };
  }

  getCurrentScoreboard() {
    return {
      gameId: 104,
      phase: "in_progress",
      participants: this.getParticipants(),
    };
  }

  async getCurrentSpectators() {
    return {
      gameId: 104,
      spectatorCount: 3,
      playerCount: 6,
      eliminatedCount: 1,
      spectators: [
        //this.toUserPreview(this.getUserById("demo-user-3")),
        //this.toUserPreview(this.getUserById("demo-user-4")),
        //this.toUserPreview(this.getUserById("demo-user-5")),
      ],
    };
  }

  getLatestGameResult() {
    return {
      gameId: 103,
      finishedAt: "2026-04-27T09:58:05Z",
      //winner: this.toUserPreview(this.getUserById("demo-user-1")),
      rankings: [
        {
          rank: 1,
          userId: "demo-user-1",
          nickname: "폭주하는타자왕",
          finalStatus: "winner",
          typedLength: 27,
          accuracy: 100,
          wpm: 341,
        },
        {
          rank: 2,
          userId: "demo-user-2",
          nickname: "침착한고슴도치",
          finalStatus: "eliminated",
          typedLength: 22,
          accuracy: 95,
          wpm: 315,
        },
      ],
    };
  }

  private getParticipants() {
    return [
      {
        userId: "demo-user-1",
        nickname: "폭주하는타자왕",
        avatarUrl: "https://cdn.example.com/avatars/fox-1.png",
        role: "player",
        status: "alive",
        progressPercent: 74,
        typedLength: 20,
        rank: 1,
        wpm: 328,
        accuracy: 98,
      },
      {
        userId: "demo-user-2",
        nickname: "침착한고슴도치",
        avatarUrl: "https://cdn.example.com/avatars/hedgehog-1.png",
        role: "player",
        status: "alive",
        progressPercent: 69,
        typedLength: 18,
        rank: 2,
        wpm: 305,
        accuracy: 97,
      },
      {
        userId: "demo-user-3",
        nickname: "도약하는치타",
        avatarUrl: "https://cdn.example.com/avatars/cheetah-1.png",
        role: "spectator",
        status: "spectating",
        progressPercent: 0,
        typedLength: 0,
        rank: 3,
        wpm: 0,
        accuracy: 0,
      },
    ];
  }

  private toUserPreview(user: UserProfile) {
    return {
      userId: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
    };
  }

  private buildUser(id: string, nickname: string, avatarUrl: string): UserProfile {
    return {
      id,
      nickname,
      avatarUrl,
      createdAt: "2026-04-27T10:00:00Z",
    };
  }

  private buildNickname(preferredNickname?: string) {
    if (preferredNickname?.trim()) {
      return preferredNickname.trim();
    }

    return `익명타자${Math.floor(Math.random() * 9000) + 1000}`;
  }

  private buildAvatarUrl() {
    const avatarIds = ["fox-1", "hedgehog-1", "cheetah-1", "hawk-1", "owl-1"];
    const avatarId = avatarIds[Math.floor(Math.random() * avatarIds.length)];

    return `https://cdn.example.com/avatars/${avatarId}.png`;
  }
}
