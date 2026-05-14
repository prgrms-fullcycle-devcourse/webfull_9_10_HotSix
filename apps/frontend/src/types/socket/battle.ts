export type BattleParticipant = {
  participantId: string;
  socketId?: string;
  gameId?: string;

  nickname?: string;
  role?: string;

  progressPercent?: number;

  acceptedLength?: number;
  typedLength?: number;

  wpm?: number;
  accuracy?: number;

  life?: number;
  typoCount?: number;
  lastPenaltyIndex?: number | null;

  status?: string;

  lastInputAt?: string;
  eliminatedAt?: string | null;
  finishedAt?: string | null;
};

export type BattleWaitingPayload = {
  gameId?: string;

  playerCount?: number;
  waitingPlayerCount?: number;

  remainingSeconds?: number;
  countdown?: number;
};

export type BattleStateLike = {
  gameId?: string;

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
