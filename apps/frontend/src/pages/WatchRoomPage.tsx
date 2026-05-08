import { useEffect } from "react";
import BgImage from "@/assets/images/racing_night.svg";
import SideBar from "@/components/common/Sidebar/SideBar";
import { mockParticipants } from "@/components/watch/mockParticipants";
import ParticipantCard from "@/components/watch/ParticipantCard";
import { useGameStore } from "@/stores/useGameStore";

const WatchRoomPage = () => {
  const participants = useGameStore((s) => s.participants);
  const setParticipants = useGameStore((s) => s.setParticipants);

  const promptText = "빠른 갈색 여우가 게으른 개를 뛰어넘는다.";

  useEffect(() => {
    setParticipants(mockParticipants);
  }, [setParticipants]);

  return (
    <div
      className="flex h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BgImage})` }}
    >
      <SideBar mode="watch" />

      {/* 참가자 영역 */}
      <div
        className="flex-1 p-6
                grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                gap-10 content-start"
      >
        {participants.map((p) => (
          <ParticipantCard
            key={p.userId}
            nickname={p.nickname}
            progress={p.progressPercent}
            typedLength={p.typedLength}
            wpm={p.wpm}
            promptText={promptText}
            life={p.life}
          />
        ))}
      </div>
    </div>
  );
};

export default WatchRoomPage;
