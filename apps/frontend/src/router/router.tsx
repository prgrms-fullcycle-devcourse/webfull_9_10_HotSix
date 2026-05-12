import { createBrowserRouter } from "react-router-dom";
import { EntryPage } from "@/pages/EntryPage";
import GameLobbyPage from "@/pages/GameLobbyPage";
import GamePage from "@/pages/GamePage";
import LoginPage from "@/pages/LoginPage";
import SettingPage from "@/pages/SettingPage";
import SpectatePage from "@/pages/SpectatePage";
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
    path: PATH.SPECTATE,
    element: <SpectatePage />,
  },
  {
    path: PATH.SETTING,
    element: <SettingPage />,
  },
  {
    path: PATH.ENTRY,
    element: <EntryPage />,
  },
]);
