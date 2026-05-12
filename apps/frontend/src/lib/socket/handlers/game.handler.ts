import { useGameStore } from "@/stores/useGameStore";
import type {
  BattleProgressPayload,
  BattleStartedPayload,
  BattleStatePayload,
  BattleWaitingPayload,
} from "../socket.types";

export const registerGameHandlers = (socket: any) => {
  const store = useGameStore.getState();

  // 게임 상태
  socket.on("battle:state", (data: BattleStatePayload) => {
    store.setPrompt(data.prompt?.content ?? "");
    store.setPhase(data.phase);
  });

  // 대기
  socket.on("battle:waiting", (data: BattleWaitingPayload) => {
    store.setPhase("waiting");
  });

  // 시작
  socket.on("battle:started", (data: BattleStartedPayload) => {
    store.setPrompt(data.prompt?.content ?? "");
    store.setPhase("in_progress");
  });

  // 진행 상황 (핵심)
  socket.on("battle:progress", (data: BattleProgressPayload) => {
    if (data?.participant) {
      store.updateParticipant({
        participantId: data.participant.participantId,
        progressPercent: data.participant.progressPercent,
        typedLength: data.participant.acceptedLength,
        life: data.participant.life,
      });
    }
  });

  // 탈락
  socket.on("battle:eliminated", (data: any) => {
    store.eliminateParticipant(data.userId);
  });

  // 종료
  socket.on("battle:finished", () => {
    store.setPhase("finished");
  });
};
