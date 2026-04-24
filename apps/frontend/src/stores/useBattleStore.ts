import { create } from "zustand";

type BattleState = {
  playerName: string;
  ready: boolean;
  setPlayerName: (value: string) => void;
  toggleReady: () => void;
};

export const useBattleStore = create<BattleState>((set) => ({
  playerName: "",
  ready: false,
  setPlayerName: (value) => set({ playerName: value }),
  toggleReady: () => set((state) => ({ ready: !state.ready })),
}));
