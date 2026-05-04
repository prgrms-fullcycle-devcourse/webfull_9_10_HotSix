import Sidebar from "@/components/game/Sidebar/SideBar";
import TypingGame from "@/components/game/TypingGame/TypingGame";

const GamePage = () => {
  return (
    <div className="flex w-full h-dvh overflow-hidden">
      <div className="w-64 shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex justify-center items-center bg-gray-100">
        <TypingGame />
      </div>
    </div>
  );
};

export default GamePage;
