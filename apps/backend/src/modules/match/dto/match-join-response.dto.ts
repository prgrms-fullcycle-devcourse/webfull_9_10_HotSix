import { ApiProperty } from "@nestjs/swagger";

export class MatchJoinResponseDto {
  @ApiProperty({
    description: "유저 UUID",
    example: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
  })
  userId!: string;

  @ApiProperty({
    description: "배정된 역할",
    enum: ["player", "spectator"],
    example: "player",
  })
  role!: "player" | "spectator";

  @ApiProperty({
    description: "현재 상태",
    example: "waiting",
  })
  status!: string;

  @ApiProperty({
    description: "연결할 소켓 네임스페이스",
    example: "/battle",
  })
  socketNamespace!: string;

  @ApiProperty({
    description: "소켓 인증 토큰",
    example: "ws_tk_12345678-1234-1234-1234-1234567890ab",
  })
  socketAuthToken!: string;
}
