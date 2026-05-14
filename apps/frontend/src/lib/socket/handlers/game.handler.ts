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
  ...(participant.socketId ? { socketId: participant.socketId } : {}),

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
  socket.off("battle:input-result");
  socket.off("battle:eliminated");
  socket.off("battle:finished");

  socket.on("battle:state", (data: BattleStatePayload) => {
    if (data?.gameId) {
      useGameStore.getState().setGameId(data.gameId);
    }

    console.log("[battle:state]", data);

    const stateData = data as BattleStateLike;
    const promptContent = stateData.prompt?.content ?? "";

    if (promptContent) {
      useGameStore.getState().setPrompt(promptContent);
    }

    useGameStore.getState().setPhase(stateData.phase);

    const participants = stateData.participants ?? [];
    console.log("[battle:state participants]", {
      participants: stateData.participants,
      participantsLength: stateData.participants?.length ?? 0,
      playerCount: stateData.playerCount,
      waitingPlayerCount: stateData.waitingPlayerCount,
    });

    const playerCount =
      stateData.playerCount ?? stateData.waitingPlayerCount ?? participants.length;

    useGameStore.getState().setWaitingState({
      playerCount,
      remainingSeconds: stateData.remainingSeconds ?? stateData.countdown ?? 0,
    });

    participants.map(mapParticipant).forEach((p) => {
      useGameStore.getState().updateParticipant(p);
    });
  });

  socket.on("battle:waiting", (data?: BattleWaitingPayload) => {
    if (data?.gameId) {
      useGameStore.getState().setGameId(data.gameId);
    }

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
    useGameStore.getState().setGameId(data.gameId);
    const promptContent = data.prompt?.content ?? "";

    if (promptContent) {
      useGameStore.getState().setPrompt(promptContent);
    }

    useGameStore.getState().setPhase("in_progress");
  });

  socket.on("battle:progress", (data: BattleProgressPayload) => {
    console.log("[battle:progress raw]", JSON.stringify(data, null, 2));

    if (!data?.participant) return;

    const participant = data.participant as BattleParticipant;

    useGameStore.getState().updateParticipant(mapParticipant(participant));
  });

  socket.on("battle:input-result", (data) => {
    console.log("[battle:input-result]", data);
  });

  socket.on("battle:eliminated", (data: BattleEliminatedPayload) => {
    useGameStore.getState().eliminateParticipant(data.participantId);
  });

  socket.on("battle:finished", () => {
    useGameStore.getState().setPhase("finished");
  });
};
