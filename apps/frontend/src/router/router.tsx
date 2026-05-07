import { createBrowserRouter } from "react-router-dom";

import GameLobbyPage from "@/pages/GameLobbyPage";
import GamePage from "@/pages/GamePage";
import LoginPage from "@/pages/LoginPage";
import SettingPage from "@/pages/SettingPage";
import WatchRoomPage from "@/pages/WatchRoomPage";
import { PATH } from "../constants/route";

export const router = createBrowserRouter([
  {
    path: PATH.ROOT,
    element: <LoginPage />,
  },
  {
    path: PATH.GAME_LOBBY,
    element: <GameLobbyPage />,
  },
  {
    path: PATH.GAME,
    element: <GamePage />,
  },
  {
    path: PATH.WATCH_ROOM,
    element: <WatchRoomPage />,
  },
  {
    path: PATH.SETTING,
    element: <SettingPage />,
  },
]);
