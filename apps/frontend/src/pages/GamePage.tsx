import { GameProgress } from "@/components/game/GameProgress";
import { RaceTrack } from "@/components/game/RaceTrack";
import SideBar from "@/components/game/sidebar/SideBar";

import TypingGame from "@/components/game/TypingGame/TypingGame";

const GamePage = () => {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <div className="shrink-0">
        <SideBar mode="game" />
      </div>

      <div className="flex flex-1 items-center justify-center bg-gray-100">
        <div className="flex w-full max-w-[916px] flex-col items-center gap-6">
          <RaceTrack progress={0} />
          <GameProgress typingCount={142} accuracy={98} time="01:14" />
          <TypingGame />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
