import { useSocketStore } from "@/stores/useSocketStore";

export const registerConnectionHandlers = (socket: any) => {
  socket.on("battle:welcome", (data: any) => {
    console.log("socket connected:", data);

    useSocketStore.getState().setConnected(true);
    useSocketStore.getState().setError(null);
  });

  socket.on("battle:error", (error: any) => {
    console.error("socket error:", error);

    useSocketStore.getState().setError(error);
    useSocketStore.getState().setConnected(false);
  });
};
