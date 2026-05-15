export type BattleParticipant = {
  participantId: string;
  socketId?: string;
  gameId?: string;

  nickname?: string;
  avatarUrl?: string;
  joinedAt?: string;
  role?: string;

  progressPercent?: number;

  acceptedLength?: number;
  typedLength?: number;

  wpm?: number;
  accuracy?: number;

  life?: number;
  typoCount?: number;
  lastPenaltyIndex?: number | null;

  status: "playing" | "finished" | "eliminated" | "spectating";

  lastInputAt?: string;
  eliminatedAt?: string | null;
  finishedAt?: string | null;
};

export type BattleWaitingPayload = {
  gameId?: string;
  phase?: "waiting";

  minPlayers?: number;
  playerCount?: number;
  waitingPlayerCount?: number;
  spectatorCount?: number;

  remainingSeconds?: number;
  countdown?: number;
  waitingEndsAt?: string;
  waitingPlayers?: {
    avatarUrl?: string;
    joinedAt?: string;
    nickname: string;
    userId: string;
  }[];
};

export type BattleStateLike = {
  gameId?: string;

  phase: "waiting" | "countdown" | "in_progress" | "finished";

  prompt?: {
    content?: string;
  };

  participants?: BattleParticipant[];
  participantNames?: string[];
  nextWaitingStartsAt?: string | null;

  waitingPlayerCount?: number;
  playerCount?: number;
  minPlayers?: number;
  spectatorCount?: number;

  remainingSeconds?: number;
  countdown?: number;
};
