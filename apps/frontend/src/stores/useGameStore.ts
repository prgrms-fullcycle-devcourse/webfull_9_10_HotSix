import { create } from "zustand";

interface Participant {
  userId: string;
  nickname: string;
  progressPercent: number;
  typedLength: number;
  wpm: number;
  life: number;
}

interface GameState {
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  updateParticipant: (data: Partial<Participant> & { userId: string }) => void;
}

export const useGameStore = create<GameState>((set) => ({
  participants: [],

  setParticipants: (p) => set({ participants: p }),

  updateParticipant: (data) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.userId === data.userId ? { ...p, ...data } : p,
      ),
    })),
}));
