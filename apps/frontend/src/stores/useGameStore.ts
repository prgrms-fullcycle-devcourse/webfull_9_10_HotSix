import { create } from "zustand";
import type { BattlePhase } from "@/lib/socket/socket.types";

interface Participant {
  participantId: string;
  nickname: string;
  progressPercent: number;
  typedLength: number;
  wpm: number;
  life: number;
}

interface GameState {
  phase: BattlePhase;
  prompt: string;

  participants: Participant[];

  setPrompt: (p: string) => void;
  setPhase: (p: BattlePhase) => void;

  setParticipants: (p: Participant[]) => void;

  updateParticipant: (p: Partial<Participant>) => void;

  eliminateParticipant: (userId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "waiting",
  prompt: "",
  participants: [],

  setPrompt: (prompt) => set({ prompt }),
  setPhase: (phase) => set({ phase }),

  setParticipants: (participants) => set({ participants }),

  updateParticipant: (data) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.participantId === data.participantId ? { ...p, ...data } : p,
      ),
    })),

  eliminateParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.participantId === participantId ? { ...p, life: 0, status: "dead" } : p,
      ),
    })),
}));
