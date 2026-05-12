import type { Socket } from "socket.io-client";
import { create } from "zustand";

type SocketState = {
  socket: Socket | null;
  connected: boolean;
  error: any | null;

  connect: (socket: Socket) => void;
  disconnect: () => void;

  setConnected: (value: boolean) => void;
  setError: (error: any | null) => void;
};

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  connected: false,
  error: null,

  connect: (socket) =>
    set({
      socket,
      connected: true,
      error: null,
    }),

  disconnect: () =>
    set({
      socket: null,
      connected: false,
      error: null,
    }),

  setConnected: (value) => set({ connected: value }),
  setError: (error) => set({ error }),
}));
