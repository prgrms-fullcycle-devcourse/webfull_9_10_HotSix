import { ApiProperty } from "@nestjs/swagger";

export class AuthUserResponseDto {
  @ApiProperty({
    description: "유저 UUID",
    example: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
  })
  id!: string;

  @ApiProperty({
    description: "유저 닉네임",
    example: "폭주하는타자왕4821",
  })
  nickname!: string;

  @ApiProperty({
    description: "아바타 이미지 URL",
    example: "https://cdn.example.com/avatars/fox-1.png",
  })
  avatarUrl!: string;

  @ApiProperty({
    description: "계정 생성 시각",
    example: "2026-05-13T04:00:00.000Z",
  })
  createdAt!: string;
}

export class AuthTokensResponseDto {
  @ApiProperty({
    description: "토큰 타입",
    example: "Bearer",
  })
  tokenType!: "Bearer";

  @ApiProperty({
    description: "액세스 토큰",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  })
  accessToken!: string;

  @ApiProperty({
    description: "액세스 토큰 유효 시간(초)",
    example: 900,
  })
  expiresIn!: number;

  @ApiProperty({
    description: "액세스 토큰 만료 시각",
    example: "2026-05-13T04:15:00.000Z",
  })
  accessTokenExpiresAt!: string;
}

export class AuthSessionResponseDto {
  @ApiProperty({
    description: "로그인된 유저 정보",
    type: () => AuthUserResponseDto,
  })
  user!: AuthUserResponseDto;

  @ApiProperty({
    description: "발급된 인증 토큰 정보",
    type: () => AuthTokensResponseDto,
  })
  tokens!: AuthTokensResponseDto;
}
