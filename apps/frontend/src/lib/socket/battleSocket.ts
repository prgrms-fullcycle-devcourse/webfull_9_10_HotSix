import { io, type Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const createBattleSocket = (socketAuthToken: string): Socket => {
  return io(`${SERVER_URL}/battle`, {
    auth: {
      token: socketAuthToken,
    },
    transports: ["websocket"],
  });
};
