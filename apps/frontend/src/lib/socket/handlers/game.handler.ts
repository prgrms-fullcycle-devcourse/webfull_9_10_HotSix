import type { Socket } from "socket.io-client";
import { useGameStore } from "@/stores/useGameStore";
import type {
  BattleEliminatedPayload,
  BattleProgressPayload,
  BattleStartedPayload,
  BattleStatePayload,
} from "../socket.types";

export const registerGameHandlers = (socket: Socket) => {
  socket.on("battle:state", (data: BattleStatePayload) => {
    useGameStore.getState().setPrompt(data.prompt?.content ?? "");
    useGameStore.getState().setPhase(data.phase);
  });

  socket.on("battle:waiting", () => {
    useGameStore.getState().setPhase("waiting");
  });

  socket.on("battle:started", (data: BattleStartedPayload) => {
    useGameStore.getState().setPrompt(data.prompt?.content ?? "");
    useGameStore.getState().setPhase("in_progress");
  });

  socket.on("battle:progress", (data: BattleProgressPayload) => {
    if (!data?.participant) return;

    useGameStore.getState().updateParticipant({
      participantId: data.participant.participantId,
      progressPercent: data.participant.progressPercent,
      typedLength: data.participant.acceptedLength,
      life: data.participant.life,
    });
  });

  socket.on("battle:eliminated", (data: BattleEliminatedPayload) => {
    useGameStore.getState().eliminateParticipant(data.participantId);
  });

  socket.on("battle:finished", () => {
    useGameStore.getState().setPhase("finished");
  });
};
