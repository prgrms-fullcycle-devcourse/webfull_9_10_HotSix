import type { ConnectionRole } from "./current-game-state";

export type BattleActiveConnection = {
  assignedRole: ConnectionRole;
  gameId: string;
  participantId: string;
  socketId: string;
};

export type BattleSocketAuthSession = {
  issuedAt: string;
  userId: string;
};
