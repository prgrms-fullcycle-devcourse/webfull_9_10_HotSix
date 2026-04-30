import { IsOptional, IsString } from "class-validator";

export class JoinLobbyDto {
  @IsOptional()
  @IsString()
  nickname?: string;
}
