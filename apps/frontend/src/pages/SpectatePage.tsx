import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import settingIcon from "@/assets/icons/settingIcon.svg";
import BgImage from "@/assets/images/racing_night.svg";
import SideBar from "@/components/common/Sidebar/SideBar";
import ParticipantCard from "@/components/spectator/ParticipantCard";
import { PATH } from "@/constants/route";
import { useGameData } from "@/hooks/useGame";
import { createBattleSocket } from "@/lib/socket/battleSocket";
import type { BattleProgressPayload } from "@/lib/socket/socket.types";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";

const SpectatePage = () => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  // socket
  useEffect(() => {
    if (!accessToken) return;

    let socket: Socket | null = null;

    const connectSocket = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      // 매치 참가만
      const joinRes = await fetch(`${apiBaseUrl}/v1/match/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const joinData = await joinRes.json();
      const socketAuthToken = joinData.socketAuthToken;

      // 소켓 연결
      socket = createBattleSocket(socketAuthToken);

      socket.on("battle:progress", (data: BattleProgressPayload) => {
        const participant = data.participant;

        useGameStore.getState().updateParticipant(participant);
      });
    };

    connectSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [accessToken]);

  useGameData();

  const participants = useGameStore((s) => s.participants);
  const prompt = useGameStore((s) => s.prompt);

  console.log(participants);

  return (
    <div
      className="flex h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BgImage})` }}
    >
      <SideBar mode="watch" />

      <div className="flex-1 flex">
        {/* 참가자 영역 */}
        <div
          className="flex-1 p-5
                  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                  gap-10 content-start"
        >
          {participants.map((p) => (
            <ParticipantCard
              key={p.participantId}
              nickname={p.nickname}
              progress={p.progressPercent}
              typedLength={p.typedLength}
              wpm={p.wpm}
              promptText={prompt}
              life={p.life}
            />
          ))}
        </div>

        {/* 설정 */}
        <div className="w-16 flex flex-col items-center pt-4 gap-4">
          <button
            type="button"
            onClick={() => navigate(PATH.SETTING)}
            className="h-10 w-10 flex items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <img src={settingIcon} alt="설정" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpectatePage;
