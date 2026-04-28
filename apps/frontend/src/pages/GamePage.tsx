import Game from "@/components/GamePage/Game";
import SideBar from "@/components/GamePage/SideBar";

const GamePage = () => {
  return (
    <div className="flex w-full h-dvh overflow-hidden">
      <SideBar />
      <Game />
    </div>
  );
};

export default GamePage;
