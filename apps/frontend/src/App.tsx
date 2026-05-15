import { useEffect, useState } from "react";
import GameLobbyPage from "@/pages/GameLobbyPage";
import GamePage from "@/pages/GamePage";
import LoginPage from "@/pages/LoginPage";
import SettingPage from "@/pages/SettingPage";
import SpectatePage from "@/pages/SpectatePage";
import { useGameData } from "./hooks/useGame";
import { useAuthStore } from "./stores/useAuthStore";
import { useGameStore } from "./stores/useGameStore";
import { useSocketStore } from "./stores/useSocketStore";
import "./stores/useThemeStore";

type ViewOverride = "game" | "setting" | "spectate" | null;

export default function App() {
  const user = useAuthStore((state) => state.user);
  const socket = useSocketStore((state) => state.socket);

  if (!user || !socket) {
    return <LoginPage />;
  }

  return <SocketDrivenApp />;
}

const SocketDrivenApp = () => {
  useGameData();

  const [viewOverride, setViewOverride] = useState<ViewOverride>(null);
  const phase = useGameStore((state) => state.phase);
  const participants = useGameStore((state) => state.participants);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const currentParticipant = participants.find(
    (participant) => participant.participantId === currentUserId,
  );

  useEffect(() => {
    if (viewOverride !== "setting" && (phase === "waiting" || phase === "countdown")) {
      setViewOverride(null);
    }
  }, [phase, viewOverride]);

  if (viewOverride === "setting") {
    return <SettingPage onBack={() => setViewOverride(null)} />;
  }

  if (viewOverride === "game") {
    return (
      <GamePage
        onHoldGameView={() => setViewOverride("game")}
        onMoveToSpectate={() => setViewOverride("spectate")}
      />
    );
  }

  if (viewOverride === "spectate") {
    return (
      <SpectatePage
        onMoveToLobby={() => setViewOverride(null)}
        onOpenSettings={() => setViewOverride("setting")}
      />
    );
  }

  if (phase === "waiting" || phase === "countdown") {
    return <GameLobbyPage onOpenSettings={() => setViewOverride("setting")} />;
  }

  if (phase === "in_progress" && currentParticipant) {
    return (
      <GamePage
        onHoldGameView={() => setViewOverride("game")}
        onMoveToSpectate={() => setViewOverride("spectate")}
      />
    );
  }

  return (
    <SpectatePage
      onMoveToLobby={() => setViewOverride(null)}
      onOpenSettings={() => setViewOverride("setting")}
    />
  );
};
