import { IsOptional, IsString, IsUrl, Length } from "class-validator";

export class UpdateMyProfileInput {
  @IsOptional()
  @IsString()
  @Length(2, 20)
  nickname?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;
}
