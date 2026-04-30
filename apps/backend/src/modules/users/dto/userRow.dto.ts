import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UserRowDto {
  @IsUUID()
  @IsNotEmpty()
  readonly id!: string;

  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @IsString()
  avatar_url!: string;

  @IsString()
  readonly created_at!: string;
}
