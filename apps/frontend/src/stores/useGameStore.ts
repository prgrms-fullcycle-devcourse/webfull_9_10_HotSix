import { create } from "zustand";
import type { BattlePhase } from "@/lib/socket/socket.types";

type GamePhase = BattlePhase | "countdown";

export interface Participant {
  participantId: string;
  nickname: string;

  progressPercent: number;
  typedLength: number;
  wpm: number;
  accuracy: number;
  life: number;

  rank?: number;

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
    set((state) => {
      const isAlreadyInGame = state.phase === "in_progress" || state.phase === "finished";

      if (isAlreadyInGame) {
        return {
          waitingPlayerCount: playerCount,
          countdown: remainingSeconds,
        };
      }

      // 최소 참가 인원 충족 전 → 항상 waiting
      if (playerCount < 2) {
        return {
          waitingPlayerCount: playerCount,
          countdown: 30,
          phase: "waiting",
        };
      }

      // 최소 참가 인원 충족 후
      return {
        waitingPlayerCount: playerCount,
        countdown: remainingSeconds,
        phase: remainingSeconds <= 10 ? "countdown" : "waiting",
      };
    }),

  setGameState: ({ waitingPlayerCount, previousWinner, previousGameDuration }) =>
    set({
      waitingPlayerCount,
      previousWinner,
      previousGameDuration,
    }),

  updateParticipant: (data) =>
    set((state) => {
      if (!data.participantId) {
        return state;
      }

      const exists = state.participants.some(
        (participant) => participant.participantId === data.participantId,
      );

      if (!exists) {
        const newParticipant: Participant = {
          participantId: data.participantId,
          nickname: data.nickname ?? "",
          progressPercent: data.progressPercent ?? 0,
          typedLength: data.typedLength ?? 0,
          wpm: data.wpm ?? 0,
          accuracy: data.accuracy ?? 100,
          life: data.life ?? 3,
          rank: data.rank ?? 0,
          status: data.status ?? "playing",
        };

        return {
          participants: [...state.participants, newParticipant],
        };
      }

      return {
        participants: state.participants.map((participant) =>
          participant.participantId === data.participantId
            ? {
                ...participant,
                ...data,
              }
            : participant,
        ),
      };
    }),

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
