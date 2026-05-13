import { ApiProperty } from "@nestjs/swagger";

export class UserProfileResponseDto {
  @ApiProperty({
    description: "유저 UUID",
    example: "8c8e1cfa-5d7a-4f36-8f31-8a0a6d7c0f0b",
  })
  id!: string;

  @ApiProperty({
    description: "유저 닉네임",
    example: "침착한치타3210",
  })
  nickname!: string;

  @ApiProperty({
    description: "아바타 이미지 URL",
    example: "https://cdn.example.com/avatars/cheetah-1.png",
  })
  avatarUrl!: string;

  @ApiProperty({
    description: "계정 생성 시각",
    example: "2026-05-13T04:00:00.000Z",
  })
  createdAt!: string;
}
