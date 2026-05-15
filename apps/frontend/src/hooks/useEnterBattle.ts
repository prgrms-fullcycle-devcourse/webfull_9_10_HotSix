import { joinMatch } from "@/api/match.api";
import { createBattleSocket } from "@/lib/socket/battleSocket";
import { registerConnectionHandlers } from "@/lib/socket/handlers/connection.handler";
import { registerGameHandlers } from "@/lib/socket/handlers/game.handler";
import { useSocketStore } from "@/stores/useSocketStore";

let isEnteringBattle = false;

export const useEnterBattle = () => {
  return async () => {
    if (isEnteringBattle) return;

    isEnteringBattle = true;

    try {
      const currentSocket = useSocketStore.getState().socket;

      if (currentSocket?.connected) {
        return;
      }

      const { socketAuthToken } = await joinMatch();

      const socket = createBattleSocket(socketAuthToken);

      useSocketStore.getState().connect(socket);

      registerConnectionHandlers(socket);
      registerGameHandlers(socket);
    } finally {
      isEnteringBattle = false;
    }
  };
};
