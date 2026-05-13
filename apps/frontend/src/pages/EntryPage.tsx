import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import { getGameDetail } from "@/api/game.api";
import { joinMatch } from "@/api/match.api";
import { PATH } from "@/constants/route";
import { createBattleSocket } from "@/lib/socket/battleSocket";
import { registerConnectionHandlers } from "@/lib/socket/handlers/connection.handler";
import { registerGameHandlers } from "@/lib/socket/handlers/game.handler";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";

export const EntryPage = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) return;

    let socket: Socket | null = null;

    const init = async () => {
      try {
        // 1. join match
        const { socketAuthToken } = await joinMatch();
        // 2. socket 생성
        socket = createBattleSocket(socketAuthToken);

        useSocketStore.getState().connect(socket);

        //  EVENT LISTENERS
        registerConnectionHandlers(socket);
        registerGameHandlers(socket);

        // 3. REST로 초기 상태 판단
        const game = await getGameDetail();

        // 4. route 결정
        if (game.game.phase === "in_progress") {
          navigate(PATH.SPECTATE);
          return;
        }

        navigate(PATH.GAME_LOBBY);
      } catch (error) {
        useSocketStore
          .getState()
          .setError(error instanceof Error ? error.message : "게임 진입에 실패했습니다.");
      }
    };

    init();

    return () => {
      socket?.disconnect();
      useSocketStore.getState().disconnect();
    };
  }, [accessToken, navigate]);

  return null;
};
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { getGameDetail } from "@/api/game.api";
// import { joinMatch } from "@/api/match.api";
// import { PATH } from "@/constants/route";
// import { createBattleSocket } from "@/lib/socket/battleSocket";
// import { registerConnectionHandlers } from "@/lib/socket/handlers/connection.handler";
// import { registerGameHandlers } from "@/lib/socket/handlers/game.handler";
// import { useAuthStore } from "@/stores/useAuthStore";
// import { useSocketStore } from "@/stores/useSocketStore";

// export const EntryPage = () => {
//   const accessToken = useAuthStore((s) => s.accessToken);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!accessToken) return;

//     let socket: any;

//     const init = async () => {
//       // 1. join match
//       const { socketAuthToken } = await joinMatch();

//       // 2. socket 생성
//       const socket = createBattleSocket(socketAuthToken);
//       useSocketStore.getState().connect(socket);

//       // 3. REST로 초기 상태 판단
//       const game = await getGameDetail();

//       // 4. route 결정
//       if (game.game.phase === "in_progress") {
//         navigate(PATH.SPECTATE);
//       } else {
//         navigate(PATH.GAME_LOBBY);
//       }

//       // 4. EVENT LISTENERS
//       registerConnectionHandlers(socket);
//       registerGameHandlers(socket);
//     };

//     init();

//     return () => {
//       socket?.disconnect();
//       useSocketStore.getState().disconnect();
//     };
//   }, [accessToken, navigate]);

//   return null;
// };
