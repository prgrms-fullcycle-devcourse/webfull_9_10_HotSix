import { create } from "zustand";
import type { BattlePhase } from "@/lib/socket/socket.types";
import type { Participant } from "@/types/game/participant";

export interface WaitingPlayer {
  avatarUrl?: string;
  joinedAt?: string;
  nickname: string;
  userId: string;
}

type GamePhase = BattlePhase | "countdown";

interface GameState {
  gameId: string | null;

  phase: GamePhase;

  prompt: string;

  participants: Participant[];
  waitingPlayers: WaitingPlayer[];

  waitingPlayerCount: number;
  spectatorCount: number;
  minPlayers: number;
  countdown: number;

  previousWinner: string;
  previousGameDuration: string;

  setGameId: (gameId: string | null) => void;

  setPrompt: (prompt: string) => void;

  setPhase: (phase: GamePhase) => void;

  setParticipants: (participants: Participant[]) => void;

  setWaitingState: (data: {
    minPlayers?: number;
    playerCount: number;
    remainingSeconds: number;
    spectatorCount?: number;
    waitingPlayers?: WaitingPlayer[];
  }) => void;

  setGameCounts: (data: { minPlayers?: number; spectatorCount?: number }) => void;

  setGameState: (data: {
    waitingPlayerCount: number;
    previousWinner: string;
    previousGameDuration: string;
  }) => void;

  updateParticipant: (data: Partial<Participant>) => void;

  eliminateParticipant: (participantId: string) => void;

  startGame: (data: { gameId: string; prompt?: string; participants?: Participant[] }) => void;

  finishGame: () => void;

  resetForWaiting: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: null,

  phase: "waiting",

  prompt: "",

  participants: [],
  waitingPlayers: [],

  waitingPlayerCount: 0,
  spectatorCount: 0,
  minPlayers: 4,
  countdown: 0,

  previousWinner: "-",
  previousGameDuration: "00:00",

  setGameId: (gameId) => set({ gameId }),

  setPrompt: (prompt) => set({ prompt }),

  setPhase: (phase) => set({ phase }),

  setParticipants: (participants) => set({ participants }),

  setWaitingState: ({
    minPlayers,
    playerCount,
    remainingSeconds,
    spectatorCount,
    waitingPlayers,
  }) =>
    set((state) => {
      const isAlreadyInGame = state.phase === "in_progress" || state.phase === "finished";

      if (isAlreadyInGame) {
        return state;
      }

      const nextMinPlayers = minPlayers ?? state.minPlayers;
      const nextPhase: GamePhase =
        playerCount < nextMinPlayers || remainingSeconds > 10 ? "waiting" : "countdown";

      return {
        waitingPlayerCount: playerCount,
        minPlayers: nextMinPlayers,
        spectatorCount: spectatorCount ?? state.spectatorCount,
        waitingPlayers: waitingPlayers ?? state.waitingPlayers,
        countdown: remainingSeconds,
        phase: nextPhase,
      };
    }),

  setGameCounts: ({ minPlayers, spectatorCount }) =>
    set((state) => ({
      minPlayers: minPlayers ?? state.minPlayers,
      spectatorCount: spectatorCount ?? state.spectatorCount,
    })),

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
          acceptedLength: data.acceptedLength ?? 0,
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
              status: "eliminated",
            }
          : participant,
      ),
    })),

  startGame: ({ gameId, prompt, participants }) =>
    set((state) => ({
      gameId,
      phase: "in_progress",
      prompt: prompt ?? state.prompt,
      participants: participants ?? state.participants,
      waitingPlayers: [],
      waitingPlayerCount: 0,
      countdown: 0,
    })),

  finishGame: () =>
    set({
      phase: "finished",
      waitingPlayers: [],
      waitingPlayerCount: 0,
      countdown: 0,
    }),

  resetForWaiting: () =>
    set({
      gameId: null,
      phase: "waiting",
      prompt: "",
      participants: [],
      waitingPlayers: [],
      waitingPlayerCount: 0,
      spectatorCount: 0,
      countdown: 0,
    }),
}));
