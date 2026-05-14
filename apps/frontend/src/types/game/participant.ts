export interface Participant {
  participantId: string;
  socketId?: string;
  nickname: string;
  progressPercent: number;
  acceptedLength: number;
  accuracy: number;
  wpm: number;
  life: number;
  rank?: number;
  status: "playing" | "finished" | "eliminated" | "spectating";
}
