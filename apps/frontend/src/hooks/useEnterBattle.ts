import { useNavigate } from "react-router-dom";
import { getGameDetail } from "@/api/game.api";
import { joinMatch } from "@/api/match.api";
import { PATH } from "@/constants/route";
import { createBattleSocket } from "@/lib/socket/battleSocket";
import { registerConnectionHandlers } from "@/lib/socket/handlers/connection.handler";
import { registerGameHandlers } from "@/lib/socket/handlers/game.handler";
import { useSocketStore } from "@/stores/useSocketStore";

let isEnteringBattle = false;

export const useEnterBattle = () => {
  const navigate = useNavigate();

  return async () => {
    if (isEnteringBattle) return;

    isEnteringBattle = true;

    try {
      const currentSocket = useSocketStore.getState().socket;

      if (currentSocket?.connected) {
        const game = await getGameDetail();

        navigate(game.game.phase === "in_progress" ? PATH.SPECTATE : PATH.GAME_LOBBY, {
          replace: true,
        });

        return;
      }

      const { socketAuthToken } = await joinMatch();

      const socket = createBattleSocket(socketAuthToken);
      console.log("소켓 생성됨", socket);

      useSocketStore.getState().connect(socket);
      console.log("소켓 store 저장 완료");

      registerConnectionHandlers(socket);
      registerGameHandlers(socket);

      console.log("소켓 핸들러 등록 완료");

      const game = await getGameDetail();

      navigate(game.game.phase === "in_progress" ? PATH.SPECTATE : PATH.GAME_LOBBY, {
        replace: true,
      });
    } finally {
      isEnteringBattle = false;
    }
  };
};
