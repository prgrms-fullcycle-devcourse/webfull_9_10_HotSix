import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const createBattleSocket = (socketAuthToken: string): Socket => {
  return io(`${SOCKET_URL}/battle`, {
    auth: {
      token: socketAuthToken,
    },
    transports: ["websocket"],
  });
};
