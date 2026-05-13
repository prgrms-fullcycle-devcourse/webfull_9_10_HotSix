import type { Socket } from "socket.io-client";
import { useGameStore } from "@/stores/useGameStore";
import type {
  BattleParticipant,
  BattleStateLike,
  BattleWaitingPayload,
} from "@/types/socket/battle";
import type {
  BattleEliminatedPayload,
  BattleProgressPayload,
  BattleStartedPayload,
  BattleStatePayload,
} from "../socket.types";

export const registerGameHandlers = (socket: Socket) => {
  socket.on("battle:state", (data: BattleStatePayload) => {
    console.log("[battle:state]", data);
    const stateData = data as BattleStateLike;

    const promptContent = stateData.prompt?.content ?? "";

    if (promptContent) {
      useGameStore.getState().setPrompt(promptContent);
    }

    useGameStore.getState().setPhase(stateData.phase);

    const playerCount =
      stateData.participants?.length ?? stateData.waitingPlayerCount ?? stateData.playerCount ?? 0;

    useGameStore.getState().setWaitingState({
      playerCount,
      remainingSeconds: stateData.remainingSeconds ?? stateData.countdown ?? 30,
    });

    stateData.participants?.forEach((participant) => {
      useGameStore.getState().updateParticipant({
        participantId: participant.participantId,
        nickname: participant.nickname ?? "플레이어",
        progressPercent: participant.progressPercent ?? 0,
        typedLength: participant.acceptedLength ?? participant.typedLength ?? 0,
        wpm: participant.wpm ?? 0,
        accuracy: participant.accuracy ?? 100,
        life: participant.life ?? 3,
        status: participant.status === "dead" ? "dead" : "playing",
      });
    });
  });

  socket.on("battle:waiting", (data?: BattleWaitingPayload) => {
    console.log("[battle:waiting]", data);

    const playerCount =
      data?.playerCount ?? data?.waitingPlayerCount ?? useGameStore.getState().participants.length;

    const remainingSeconds =
      data?.remainingSeconds ?? data?.countdown ?? useGameStore.getState().countdown;

    console.log("[battle:waiting parsed]", {
      playerCount,
      remainingSeconds,
      currentCountdown: useGameStore.getState().countdown,
    });
    useGameStore.getState().setWaitingState({
      playerCount,
      remainingSeconds,
    });
  });

  socket.on("battle:started", (data: BattleStartedPayload) => {
    const promptContent = data.prompt?.content ?? "";

    if (promptContent) {
      useGameStore.getState().setPrompt(promptContent);
    }

    useGameStore.getState().setPhase("in_progress");
  });

  socket.on("battle:progress", (data: BattleProgressPayload) => {
    if (!data?.participant) return;

    const participant = data.participant as BattleParticipant;

    useGameStore.getState().updateParticipant({
      participantId: participant.participantId,
      nickname: participant.nickname ?? "플레이어",
      progressPercent: participant.progressPercent ?? 0,
      typedLength: participant.acceptedLength ?? participant.typedLength ?? 0,
      wpm: participant.wpm ?? 0,
      accuracy: participant.accuracy ?? 100,
      life: participant.life ?? 3,
      status: participant.status === "dead" ? "dead" : "playing",
    });
  });

  socket.on("battle:eliminated", (data: BattleEliminatedPayload) => {
    useGameStore.getState().eliminateParticipant(data.participantId);
  });

  socket.on("battle:finished", () => {
    useGameStore.getState().setPhase("finished");
  });
};
