import { useNavigate } from "react-router-dom";
import settingIcon from "@/assets/icons/settingIcon.svg";
import { PATH } from "@/constants/route";

const GameLobbyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      {/* 우측 상단 설정 버튼 */}
      <button
        type="button"
        onClick={() => navigate(PATH.SETTING)}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
        aria-label="설정"
      >
        <img src={settingIcon} alt="설정" />
      </button>

      <div>GameLobbyPage</div>
    </div>
  );
};

export default GameLobbyPage;
