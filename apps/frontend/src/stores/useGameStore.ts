import { create } from "zustand";
import type { BattlePhase } from "@/lib/socket/socket.types";

type GamePhase = BattlePhase | "countdown";

interface Participant {
  participantId: string;
  nickname: string;

  progressPercent: number;
  typedLength: number;
  wpm: number;

  life: number;

  status?: "playing" | "dead";
}

interface GameState {
  phase: GamePhase;

  prompt: string;

  participants: Participant[];

  waitingPlayerCount: number;
  countdown: number;

  previousWinner: string;
  previousGameDuration: string;

  setPrompt: (prompt: string) => void;

  setPhase: (phase: GamePhase) => void;

  setParticipants: (participants: Participant[]) => void;

  setWaitingState: (data: { playerCount: number; remainingSeconds: number }) => void;

  setGameState: (data: {
    waitingPlayerCount: number;
    previousWinner: string;
    previousGameDuration: string;
  }) => void;

  updateParticipant: (data: Partial<Participant>) => void;

  eliminateParticipant: (participantId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "waiting",

  prompt: "",

  participants: [],

  waitingPlayerCount: 0,
  countdown: 10,

  previousWinner: "-",
  previousGameDuration: "00:00",

  setPrompt: (prompt) => set({ prompt }),

  setPhase: (phase) => set({ phase }),

  setParticipants: (participants) => set({ participants }),

  setWaitingState: ({ playerCount, remainingSeconds }) =>
    set({
      waitingPlayerCount: playerCount,
      countdown: remainingSeconds,
      phase: remainingSeconds <= 10 ? "countdown" : "waiting",
    }),

  setGameState: ({ waitingPlayerCount, previousWinner, previousGameDuration }) =>
    set({
      waitingPlayerCount,
      previousWinner,
      previousGameDuration,
    }),

  updateParticipant: (data) =>
    set((state) => ({
      participants: state.participants.map((participant) =>
        participant.participantId === data.participantId
          ? {
              ...participant,
              ...data,
            }
          : participant,
      ),
    })),

  eliminateParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.map((participant) =>
        participant.participantId === participantId
          ? {
              ...participant,
              life: 0,
              status: "dead",
            }
          : participant,
      ),
    })),
}));
