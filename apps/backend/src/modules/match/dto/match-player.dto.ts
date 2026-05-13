import { ApiProperty } from "@nestjs/swagger";

export class MatchPlayerDto {
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
    description: "아바타 이미지 URL",
    example: "https://cdn.example.com/avatars/owl-1.png",
  })
  avatarUrl!: string;

  @ApiProperty({
    description: "현재 상태",
    example: "waiting",
  })
  status!: string;

  @ApiProperty({
    description: "참가 역할",
    enum: ["player", "spectator"],
    example: "player",
  })
  role!: "player" | "spectator";

  @ApiProperty({
    description: "로비 참가 시각",
    example: "2026-05-13T04:00:00.000Z",
  })
  joinedAt!: string;
}
