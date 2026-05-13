export type BattleParticipant = {
  participantId: string;

  nickname?: string;

  progressPercent?: number;

  acceptedLength?: number;
  typedLength?: number;

  wpm?: number;
  accuracy?: number;

  life?: number;

  status?: string;
};

export type BattleWaitingPayload = {
  playerCount?: number;

  waitingPlayerCount?: number;

  remainingSeconds?: number;
  countdown?: number;
};

export type BattleStateLike = {
  phase: "waiting" | "countdown" | "in_progress" | "finished";

  prompt?: {
    content?: string;
  };

  participants?: BattleParticipant[];

  waitingPlayerCount?: number;
  playerCount?: number;

  remainingSeconds?: number;
  countdown?: number;
};
