import { IsString, IsUrl, Length } from "class-validator";

export class CreateGuestUserInput {
  @IsString()
  @Length(2, 20)
  nickname!: string;

  @IsString()
  @IsUrl()
  avatarUrl!: string;
}
