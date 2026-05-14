import { create } from "zustand";
import type { BattlePhase } from "@/lib/socket/socket.types";

const MIN_PLAYERS = 1;

type GamePhase = BattlePhase | "countdown";

export interface Participant {
  participantId: string;
  socketId?: string;

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
  gameId: string | null;

  phase: GamePhase;

  prompt: string;

  participants: Participant[];

  waitingPlayerCount: number;
  countdown: number;

  previousWinner: string;
  previousGameDuration: string;

  setGameId: (gameId: string | null) => void;

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
  gameId: null,

  phase: "waiting",

  prompt: "",

  participants: [],

  waitingPlayerCount: 0,
  countdown: 0,

  previousWinner: "-",
  previousGameDuration: "00:00",

  setGameId: (gameId) => set({ gameId }),

  setPrompt: (prompt) => set({ prompt }),

  setPhase: (phase) => set({ phase }),

  setParticipants: (participants) => set({ participants }),

  setWaitingState: ({ playerCount, remainingSeconds }) =>
    set((state) => {
      const isAlreadyInGame = state.phase === "in_progress" || state.phase === "finished";

      if (isAlreadyInGame) {
        return state;
      }

      const nextPhase: GamePhase =
        playerCount < MIN_PLAYERS || remainingSeconds > 10 ? "waiting" : "countdown";

      return {
        waitingPlayerCount: playerCount,
        countdown: remainingSeconds,
        phase: nextPhase,
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
          status: data.status ?? "playing",
          ...(data.socketId ? { socketId: data.socketId } : {}),
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
