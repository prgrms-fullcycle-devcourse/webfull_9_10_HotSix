import { createBrowserRouter } from "react-router-dom";

import GameLobbyPage from "@/pages/GameLobbyPage";
import GamePage from "@/pages/GamePage";
import LoginPage from "@/pages/LoginPage";
import { PATH } from "../constants/path";

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
]);
