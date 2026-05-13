import { ApiProperty } from "@nestjs/swagger";

export class CurrentGameInfoDto {
  @ApiProperty({ example: "f2f796d1-5300-4b95-abf7-7761f5328d93" })
  id!: string;

  @ApiProperty({ example: "waiting" })
  phase!: string;

  @ApiProperty({ example: "2026-05-13T04:00:00.000Z" })
  startedAt!: string;

  @ApiProperty({ example: 4 })
  minPlayers!: number;

  @ApiProperty({ example: 3 })
  playerCount!: number;

  @ApiProperty({ example: 1 })
  spectatorCount!: number;

  @ApiProperty({ example: "2026-05-13T03:59:30.000Z" })
  waitingStartedAt!: string;

  @ApiProperty({ example: "2026-05-13T04:00:00.000Z" })
  waitingEndsAt!: string;

  @ApiProperty({ example: "2026-05-13T04:00:00.000Z" })
  gameStartedAt!: string;

  @ApiProperty({ example: "" })
  gameEndedAt!: string;

  @ApiProperty({ example: "2026-05-13T03:59:30.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2026-05-13T04:00:01.000Z" })
  updatedAt!: string;
}

export class CurrentPromptDto {
  @ApiProperty({ example: "prompt-2026-05-13-01" })
  id!: string;

  @ApiProperty({ example: "daily-korean-typing-1" })
  slug!: string;

  @ApiProperty({ example: "오늘의 타자 연습" })
  title!: string;

  @ApiProperty({ example: "빠르게 입력하며 정확도를 유지해보세요." })
  content!: string;

  @ApiProperty({ example: 23 })
  contentLength!: number;

  @ApiProperty({ example: "ko" })
  language!: string;
}

export class CurrentGameParticipantDto {
  @ApiProperty({ example: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b" })
  userId!: string;

  @ApiProperty({ example: "민첩한여우5832" })
  nickname!: string;

  @ApiProperty({ example: "https://cdn.example.com/avatars/owl-1.png" })
  avatarUrl!: string;

  @ApiProperty({ example: "waiting" })
  status!: string;

  @ApiProperty({ enum: ["player", "spectator"], example: "player" })
  role!: "player" | "spectator";

  @ApiProperty({ example: "2026-05-13T04:00:00.000Z" })
  joinedAt!: string;

  @ApiProperty({ example: 64 })
  progressPercent!: number;

  @ApiProperty({ example: 1 })
  rank!: number;

  @ApiProperty({ example: 376.4 })
  wpm!: number;

  @ApiProperty({ example: 3 })
  life!: number;

  @ApiProperty({ example: 97.4 })
  accuracy!: number;

  @ApiProperty({ example: false })
  isEliminated!: boolean;

  @ApiProperty({ example: 148 })
  acceptedLength!: number;
}

export class CurrentGameResponseDto {
  @ApiProperty({ type: () => CurrentGameInfoDto })
  game!: CurrentGameInfoDto;

  @ApiProperty({ type: () => CurrentPromptDto })
  prompt!: CurrentPromptDto;

  @ApiProperty({ type: () => CurrentGameParticipantDto, isArray: true })
  participants!: CurrentGameParticipantDto[];
}

export class CurrentSpectatorDto {
  @ApiProperty({ example: "7f1a3b47-6d3b-4f0c-930d-82914f0ac221" })
  userId!: string;

  @ApiProperty({ example: "질주하는매4012" })
  nickname!: string;

  @ApiProperty({ example: "https://cdn.example.com/avatars/hawk-1.png" })
  avatarUrl!: string;

  @ApiProperty({ example: "2026-05-13T04:00:00.000Z" })
  joinedAt!: string;
}

export class CurrentScoreboardEntryDto extends CurrentGameParticipantDto {
  @ApiProperty({ example: "finished" })
  finalStatus?: string;

  @ApiProperty({ example: true })
  isWinner?: boolean;
}

export class GameResultRankingUserDto {
  @ApiProperty({ example: "침착한치타3210" })
  nickname?: string;

  @ApiProperty({ example: "https://cdn.example.com/avatars/cheetah-1.png" })
  avatar_url?: string;
}

export class GameResultRankingDto {
  @ApiProperty({ example: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b" })
  user_id!: string;

  @ApiProperty({ example: "f2f796d1-5300-4b95-abf7-7761f5328d93" })
  game_id!: string;

  @ApiProperty({ example: 1 })
  final_rank?: number;

  @ApiProperty({ example: true })
  is_winner?: boolean;

  @ApiProperty({ example: true })
  is_survived?: boolean;

  @ApiProperty({ example: 3 })
  life?: number;

  @ApiProperty({ example: 412.5 })
  wpm?: number;

  @ApiProperty({ example: 98.2 })
  accuracy?: number;

  @ApiProperty({ example: "2026-05-13T04:00:00.000Z" })
  created_at?: string;

  @ApiProperty({ type: () => GameResultRankingUserDto })
  users?: GameResultRankingUserDto;
}

export class LatestGameResultResponseDto {
  @ApiProperty({ example: "f2f796d1-5300-4b95-abf7-7761f5328d93" })
  gameId!: string;

  @ApiProperty({ example: "2026-05-13T04:00:00.000Z" })
  startedAt!: string;

  @ApiProperty({ example: "2026-05-13T04:03:30.000Z" })
  endedAt!: string;

  @ApiProperty({ example: "침착한치타3210" })
  winner!: string;

  @ApiProperty({ type: () => GameResultRankingDto, isArray: true })
  rankings!: GameResultRankingDto[];
}
