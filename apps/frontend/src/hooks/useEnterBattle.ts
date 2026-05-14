import { useNavigate } from "react-router-dom";
import { getGameDetail } from "@/api/game.api";
import { joinMatch } from "@/api/match.api";
import { PATH } from "@/constants/route";
import { createBattleSocket } from "@/lib/socket/battleSocket";
import { registerConnectionHandlers } from "@/lib/socket/handlers/connection.handler";
import { registerGameHandlers } from "@/lib/socket/handlers/game.handler";
import { useSocketStore } from "@/stores/useSocketStore";

let isEnteringBattle = false;

const getNextPath = (phase: string) => {
  return phase === "in_progress" ? PATH.SPECTATE : PATH.GAME_LOBBY;
};

export const useEnterBattle = () => {
  const navigate = useNavigate();

  return async () => {
    if (isEnteringBattle) return;

    isEnteringBattle = true;

    try {
      const currentSocket = useSocketStore.getState().socket;

      if (currentSocket?.connected) {
        const game = await getGameDetail();
        const nextPath = getNextPath(game.game.phase);

        navigate(nextPath, {
          replace: true,
        });

        return;
      }

      const { socketAuthToken } = await joinMatch();

      const socket = createBattleSocket(socketAuthToken);

      useSocketStore.getState().connect(socket);

      registerConnectionHandlers(socket);
      registerGameHandlers(socket);

      const game = await getGameDetail();
      const nextPath = getNextPath(game.game.phase);

      navigate(nextPath, {
        replace: true,
      });
    } finally {
      isEnteringBattle = false;
    }
  };
};
