import type { Socket } from "socket.io-client";
import { useSocketStore } from "@/stores/useSocketStore";
import { BATTLE_SOCKET_EVENTS } from "../socketEvents";

export const registerConnectionHandlers = (socket: Socket) => {
  console.log("connection handler 등록");

  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");
  socket.off(BATTLE_SOCKET_EVENTS.ERROR);

  socket.on("connect", () => {
    console.log("socket connected", socket.id);
    useSocketStore.getState().setConnected(true);
  });

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected", reason);
    useSocketStore.getState().setConnected(false);
  });

  socket.on("connect_error", (error) => {
    console.error("socket connect error", error);
    useSocketStore.getState().setError(error.message ?? "소켓 연결 실패");
  });

  socket.on(BATTLE_SOCKET_EVENTS.ERROR, (error) => {
    console.error("battle socket error", error);
    useSocketStore.getState().setError(error?.message ?? "소켓 에러가 발생했습니다.");
  });
};
