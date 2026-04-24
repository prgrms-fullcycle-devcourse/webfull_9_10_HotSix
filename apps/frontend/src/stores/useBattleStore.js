import { create } from "zustand";
export const useBattleStore = create((set) => ({
  playerName: "",
  ready: false,
  setPlayerName: (value) => set({ playerName: value }),
  toggleReady: () => set((state) => ({ ready: !state.ready })),
}));
