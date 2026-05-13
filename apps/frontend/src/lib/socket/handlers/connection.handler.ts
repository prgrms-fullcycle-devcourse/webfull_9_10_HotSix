import type { Socket } from "socket.io-client";
import { useSocketStore } from "@/stores/useSocketStore";
import { BATTLE_SOCKET_EVENTS } from "../socketEvents";

export const registerConnectionHandlers = (socket: Socket) => {
  socket.on("connect", () => {
    useSocketStore.getState().setConnected(true);
  });

  socket.on("disconnect", () => {
    useSocketStore.getState().setConnected(false);
  });

  socket.on("connect_error", (error) => {
    useSocketStore.getState().setError(error.message ?? "소켓 연결 실패");
  });

  socket.on(BATTLE_SOCKET_EVENTS.ERROR, (error) => {
    useSocketStore.getState().setError(error?.message ?? "소켓 에러가 발생했습니다.");
  });
};
