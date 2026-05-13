import type { Socket } from "socket.io-client";
import { type Participant, useGameStore } from "@/stores/useGameStore";
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

const mapParticipant = (participant: BattleParticipant): Participant => ({
  participantId: participant.participantId,
  nickname: participant.nickname ?? "플레이어",
  progressPercent: participant.progressPercent ?? 0,
  typedLength: participant.acceptedLength ?? participant.typedLength ?? 0,
  wpm: participant.wpm ?? 0,
  accuracy: participant.accuracy ?? 100,
  life: participant.life ?? 3,
  status: participant.status === "dead" ? "dead" : "playing",
});

export const registerGameHandlers = (socket: Socket) => {
  socket.off("battle:state");
  socket.off("battle:waiting");
  socket.off("battle:started");
  socket.off("battle:progress");
  socket.off("battle:eliminated");
  socket.off("battle:finished");

  socket.on("battle:state", (data: BattleStatePayload) => {
    console.log("[battle:state]", data);

    const stateData = data as BattleStateLike;
    const promptContent = stateData.prompt?.content ?? "";

    if (promptContent) {
      useGameStore.getState().setPrompt(promptContent);
    }

    useGameStore.getState().setPhase(stateData.phase);

    const participants = stateData.participants ?? [];

    const playerCount =
      stateData.playerCount ?? stateData.waitingPlayerCount ?? participants.length;

    useGameStore.getState().setWaitingState({
      playerCount,
      remainingSeconds: stateData.remainingSeconds ?? stateData.countdown ?? 0,
    });

    useGameStore.getState().setParticipants(participants.map(mapParticipant));
  });

  socket.on("battle:waiting", (data?: BattleWaitingPayload) => {
    console.log("[battle:waiting]", data);

    const playerCount =
      data?.playerCount ?? data?.waitingPlayerCount ?? useGameStore.getState().participants.length;

    const remainingSeconds = data?.remainingSeconds ?? data?.countdown ?? 0;

    console.log("[battle:waiting parsed]", {
      playerCount,
      remainingSeconds,
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

    useGameStore.getState().updateParticipant(mapParticipant(participant));
  });

  socket.on("battle:eliminated", (data: BattleEliminatedPayload) => {
    useGameStore.getState().eliminateParticipant(data.participantId);
  });

  socket.on("battle:finished", () => {
    useGameStore.getState().setPhase("finished");
  });
};
