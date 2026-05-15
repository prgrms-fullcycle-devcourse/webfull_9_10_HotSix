import type { Status } from "@/types/game/gameDetail";

export type BattlePhase = "waiting" | "in_progress" | "finished";

export interface BattleSocketParticipant {
  acceptedLength?: number;
  accuracy?: number;
  avatarUrl?: string;
  eliminatedAt?: string | null;
  finishedAt?: string | null;
  joinedAt?: string;
  lastInputAt?: string | null;
  life?: number;
  nickname?: string;
  participantId: string;
  progressPercent?: number;
  role?: "player" | "spectator";
  socketId?: string;
  status: Status;
  typedLength?: number;
  typoCount?: number;
  wpm?: number;
}

export interface BattleStatePayload {
  gameId: string;
  phase: BattlePhase;

  prompt: {
    id: number;
    title: string;
    content?: string;
    contentLength: number;
  };

  minPlayers: number;
  playerCount: number;
  participantNames?: string[];
  participants?: BattleSocketParticipant[];
  spectatorCount: number;

  gameStartedAt: string | null;
  gameEndedAt: string | null;
  nextWaitingStartsAt?: string | null;
}

export interface BattleWaitingPayload {
  gameId: string;
  phase: "waiting";
  remainingSeconds: number;

  minPlayers: number;
  playerCount: number;
  spectatorCount: number;
  waitingPlayers?: {
    avatarUrl?: string;
    joinedAt?: string;
    nickname: string;
    userId: string;
  }[];

  prompt: {
    id: number;
    title: string;
    contentLength: number;
  };
}

export interface BattleStartedPayload {
  gameId: string;
  phase: "in_progress";

  prompt: {
    id: number;
    slug: string;
    title: string;
    content: string;
    contentLength: number;
  };

  gameStartedAt: string;

  participantNames?: string[];
  participants?: BattleSocketParticipant[];
}

export interface BattleProgressPayload {
  gameId: string;

  participant: BattleSocketParticipant & {
    participantId: string;
    socketId: string;
    role: "player" | "spectator";
    status: Status;

    acceptedLength: number;
    progressPercent: number;
    accuracy: number;
    life: number;
    typoCount: number;
    lastInputAt: string;
  };
}

export interface BattleEliminatedPayload {
  gameId: string;
  userId: string;
  participantId: string;
  socketId: string;
  reason: "typo" | "timeout" | "disconnect";
}

export interface BattleFinishedPayload {
  finishedAt: string | null;
  gameId: string;
  nextWaitingStartsAt?: string | null;
  rankings?: unknown[];
  reason?: string | null;
  winnerParticipantId?: string | null;
}
