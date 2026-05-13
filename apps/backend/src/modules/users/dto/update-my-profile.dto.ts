import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, Length } from "class-validator";

export class UpdateMyProfileInput {
  @ApiPropertyOptional({
    description: "변경할 닉네임",
    minLength: 2,
    maxLength: 20,
    example: "typing-ace",
  })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  nickname?: string;

  @ApiPropertyOptional({
    description: "변경할 아바타 이미지 URL",
    example: "https://example.com/avatar.png",
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;
}
