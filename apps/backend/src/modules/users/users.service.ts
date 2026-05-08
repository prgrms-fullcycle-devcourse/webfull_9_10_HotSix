import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UpdateMyProfileInput } from "./dto/update-my-profile.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMyProfile(userId: string) {
    return this.usersRepository.findById(userId);
  }

  async getMyDashboard(userId: string) {
    return this.usersRepository.findDashboardByUserId(userId);
  }

  async updateMyProfile(userId: string, input: UpdateMyProfileInput) {
    return this.usersRepository.updateGuestUser(userId, input);
  }

  async deleteMyProfile(userId: string) {
    return this.usersRepository.deleteGuestUser(userId);
  }
  async createGuestUser() {
    const nickname = this.buildRandomNickname();
    const avatarUrl = this.buildRandomAvatarUrl();

    return this.usersRepository.createGuestUser({
      nickname,
      avatarUrl,
    });
  }

  async updateDashboardAfterGame(
    userId: string,
    gameResult: {
      rank: number;
      wpm: number;
      isWinner: boolean;
      acceptedLength: number;
    },
  ) {
    const currentStats = await this.usersRepository.findDashboardByUserId(userId);
    const totalGames = currentStats.totalGames + 1;

    const avgRank =
      Math.round(
        ((currentStats.averageRank * currentStats.totalGames + gameResult.rank) / totalGames) * 10,
      ) / 10;

    const wpm = Math.round(
      (currentStats.wpm * currentStats.totalGames + gameResult.wpm) / totalGames,
    );

    const wordCount = Math.round(gameResult.acceptedLength / 5);
    const avgWordCount = Math.round(
      (currentStats.averageWordCount * currentStats.totalGames + wordCount) / totalGames,
    );
    const totalWordCount = currentStats.totalWordCount + wordCount;

    return this.usersRepository.updateDashboardByUserId(userId, {
      totalGames,
      wins: gameResult.isWinner ? currentStats.wins + 1 : currentStats.wins,
      avgRank,
      wpm,
      avgWordCount,
      totalWordCount,
    });
  }

  private buildRandomNickname(): string {
    const adjectives = ["폭주하는", "민첩한", "집중하는", "질주하는", "침착한"];
    const animals = ["타자왕", "치타", "여우", "고슴도치", "매"];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)] ?? "질주하는";
    const animal = animals[Math.floor(Math.random() * animals.length)] ?? "타자왕";
    const suffix = Math.floor(Math.random() * 9000) + 1000;

    return `${adjective}${animal}${suffix}`;
  }

  private buildRandomAvatarUrl(): string {
    const fallbackAvatarUrl = "https://cdn.example.com/avatars/fox-1.png";
    const avatars = [
      fallbackAvatarUrl,
      "https://cdn.example.com/avatars/hedgehog-1.png",
      "https://cdn.example.com/avatars/cheetah-1.png",
      "https://cdn.example.com/avatars/hawk-1.png",
      "https://cdn.example.com/avatars/owl-1.png",
    ];

    return avatars[Math.floor(Math.random() * avatars.length)] ?? fallbackAvatarUrl;
  }
}
