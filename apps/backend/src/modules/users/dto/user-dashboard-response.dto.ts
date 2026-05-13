import { ApiProperty } from "@nestjs/swagger";

export class UserDashboardResponseDto {
  @ApiProperty({
    description: "유저 UUID",
    example: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
  })
  userId!: string;

  @ApiProperty({
    description: "유저 닉네임",
    example: "민첩한여우5832",
  })
  nickname!: string;

  @ApiProperty({
    description: "가입 시각",
    example: "2026-05-13T04:00:00.000Z",
  })
  joinedAt!: string;

  @ApiProperty({
    description: "총 플레이 수",
    example: 18,
  })
  totalGames!: number;

  @ApiProperty({
    description: "총 승리 수",
    example: 7,
  })
  wins!: number;

  @ApiProperty({
    description: "평균 순위",
    example: 2.3,
  })
  averageRank!: number;

  @ApiProperty({
    description: "평균 분당 타수",
    example: 376.4,
  })
  wpm!: number;

  @ApiProperty({
    description: "평균 인정 글자 수",
    example: 193.6,
  })
  averageWordCount!: number;

  @ApiProperty({
    description: "누적 인정 글자 수",
    example: 3485,
  })
  totalWordCount!: number;
}
