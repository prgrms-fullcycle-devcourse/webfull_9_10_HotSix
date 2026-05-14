import { useNavigate } from "react-router-dom";
import settingIcon from "@/assets/icons/settingIcon.svg";
import BgImage from "@/assets/images/racing_night.svg";
import SideBar from "@/components/common/Sidebar/SideBar";
import ParticipantCard from "@/components/spectator/ParticipantCard";
import { PATH } from "@/constants/route";
import { useGameData } from "@/hooks/useGame";
import { useGameStore } from "@/stores/useGameStore";

const SpectatePage = () => {
  const navigate = useNavigate();

  useGameData();

  const participants = useGameStore((s) => s.participants);
  const prompt = useGameStore((s) => s.prompt);

  return (
    <div
      className="relative flex h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${BgImage})` }}
    >
      <SideBar mode="spectate" />

      {/* 참가자 카드 영역 */}
      <div className="relative flex-1 overflow-hidden px-10 pt-6 pb-6">
        <div
          className="
            h-full
            overflow-y-auto
            overflow-x-hidden
            pr-5
            pb-8

            [&::-webkit-scrollbar]:w-4
            [&::-webkit-scrollbar-track]:bg-[#2f2f2f]
            [&::-webkit-scrollbar-track]:border-[3px]
            [&::-webkit-scrollbar-track]:border-black

            [&::-webkit-scrollbar-thumb]:bg-white
            [&::-webkit-scrollbar-thumb]:border-[3px]
            [&::-webkit-scrollbar-thumb]:border-black
            [&::-webkit-scrollbar-thumb]:rounded-none

            hover:[&::-webkit-scrollbar-thumb]:bg-[#ffd83d]
          "
        >
          <div
            className="
              grid
              grid-cols-3
              gap-x-8
              gap-y-10
              items-start
              justify-items-center
            "
          >
            {participants.map((p) => (
              <ParticipantCard
                key={p.participantId}
                nickname={p.nickname}
                progress={p.progressPercent ?? 0}
                acceptedLength={p.acceptedLength ?? 0}
                wpm={p.wpm ?? 0}
                promptText={prompt ?? ""}
                life={p.life ?? 3}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 설정 */}
      <button
        type="button"
        onClick={() => navigate(PATH.SETTING)}
        className="absolute right-5 top-5 h-10 w-10 flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px]"
      >
        <img src={settingIcon} alt="설정" />
      </button>
    </div>
  );
};

export default SpectatePage;
