import { IsNotEmpty, IsUUID } from "class-validator";

export class ParticipantDto {
  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  @IsUUID()
  @IsNotEmpty()
  game_id!: string;

  chat_id?: string;
  final_rank?: number;
  is_winner?: boolean;
  is_survived?: boolean;
  life?: number;
  wpm?: number;
  accuracy?: number;
  created_at?: string;
}

export class ParticipantExtendDto extends ParticipantDto {
  users?: {
    nickname?: string;
    avatar_url?: string;
  };
}
