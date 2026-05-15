import type { Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGameStore } from "@/stores/useGameStore";
import type { Participant } from "@/types/game/participant";
import type {
  BattleParticipant,
  BattleStateLike,
  BattleWaitingPayload,
} from "@/types/socket/battle";
import type {
  BattleEliminatedPayload,
  BattleFinishedPayload,
  BattleProgressPayload,
  BattleSocketParticipant,
  BattleStartedPayload,
  BattleStatePayload,
} from "../socket.types";

type ParticipantUpdate = Partial<Participant> & Pick<Participant, "participantId">;
type ParticipantIdentity = {
  nickname?: string;
  participantId: string;
  socketId?: string;
};

const upsertCurrentUserAsWaitingPlayer = () => {
  const user = useAuthStore.getState().user;

  if (!user) {
    return;
  }

  useGameStore.getState().upsertWaitingPlayer({
    avatarUrl: user.avatarUrl,
    joinedAt: new Date().toISOString(),
    nickname: user.nickname,
    userId: user.id,
  });
};

const mapParticipant = (participant: BattleParticipant): ParticipantUpdate => ({
  participantId: participant.participantId,
  ...(participant.socketId ? { socketId: participant.socketId } : {}),
  ...(participant.nickname ? { nickname: participant.nickname } : {}),
  ...(participant.progressPercent !== undefined
    ? { progressPercent: participant.progressPercent }
    : {}),
  ...(participant.acceptedLength !== undefined || participant.typedLength !== undefined
    ? { acceptedLength: participant.acceptedLength ?? participant.typedLength ?? 0 }
    : {}),
  ...(participant.wpm !== undefined ? { wpm: participant.wpm } : {}),
  ...(participant.accuracy !== undefined ? { accuracy: participant.accuracy } : {}),
  ...(participant.life !== undefined ? { life: participant.life } : {}),
  status: participant.status,
});

const mapParticipantIdentity = (participant: ParticipantIdentity): ParticipantUpdate => ({
  participantId: participant.participantId,
  ...(participant.socketId ? { socketId: participant.socketId } : {}),
  ...(participant.nickname ? { nickname: participant.nickname } : {}),
});

const mapParticipantSnapshot = (participant: BattleSocketParticipant): Participant => ({
  participantId: participant.participantId,
  ...(participant.socketId ? { socketId: participant.socketId } : {}),
  nickname: participant.nickname ?? "플레이어",
  progressPercent: participant.progressPercent ?? 0,
  acceptedLength: participant.acceptedLength ?? participant.typedLength ?? 0,
  wpm: participant.wpm ?? 0,
  accuracy: participant.accuracy ?? 100,
  life: participant.life ?? 3,
  status: participant.status,
});

export const registerGameHandlers = (socket: Socket) => {
  const store = useGameStore.getState();
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
      store.setPrompt(promptContent);
    }

    store.setPhase(stateData.phase);
    useGameStore.getState().setNextWaitingStartsAt(stateData.nextWaitingStartsAt ?? null);
    useGameStore.getState().setGameCounts({
      ...(stateData.minPlayers !== undefined ? { minPlayers: stateData.minPlayers } : {}),
      ...(stateData.spectatorCount !== undefined
        ? { spectatorCount: stateData.spectatorCount }
        : {}),
    });

    const participants = stateData.participants ?? [];
    console.log("[battle:state participants]", {
      participantNames: stateData.participantNames,
      participants: stateData.participants,
      participantsLength: stateData.participants?.length ?? 0,
      playerCount: stateData.playerCount,
      waitingPlayerCount: stateData.waitingPlayerCount,
    });

    const playerCount =
      stateData.playerCount ?? stateData.waitingPlayerCount ?? participants.length;

    if (stateData.phase === "waiting" || stateData.phase === "countdown") {
      store.setWaitingState({
        playerCount,
        remainingSeconds: stateData.remainingSeconds ?? stateData.countdown ?? 0,
        ...(stateData.minPlayers !== undefined ? { minPlayers: stateData.minPlayers } : {}),
        ...(stateData.spectatorCount !== undefined
          ? { spectatorCount: stateData.spectatorCount }
          : {}),
      });
      upsertCurrentUserAsWaitingPlayer();
    }

    participants.map(mapParticipantIdentity).forEach((p) => {
      useGameStore.getState().updateParticipant(p);
    });
  });

  socket.on("battle:waiting", (data?: BattleWaitingPayload) => {
    if (data?.gameId) {
      useGameStore.getState().setGameId(data.gameId);
    }

    console.log("[battle:waiting]", data);

    const playerCount = data?.playerCount ?? data?.waitingPlayerCount ?? store.participants.length;

    const remainingSeconds = data?.remainingSeconds ?? data?.countdown ?? 0;

    console.log("[battle:waiting parsed]", {
      playerCount,
      remainingSeconds,
    });

    store.setWaitingState({
      playerCount,
      remainingSeconds,
      ...(data?.minPlayers !== undefined ? { minPlayers: data.minPlayers } : {}),
      ...(data?.spectatorCount !== undefined ? { spectatorCount: data.spectatorCount } : {}),
      ...(data?.waitingPlayers !== undefined ? { waitingPlayers: data.waitingPlayers } : {}),
    });

    if ((data?.waitingPlayers?.length ?? 0) === 0 && playerCount > 0) {
      upsertCurrentUserAsWaitingPlayer();
    }
  });

  socket.on("battle:started", (data: BattleStartedPayload) => {
    const promptContent = data.prompt?.content ?? "";

    useGameStore.getState().startGame({
      gameId: data.gameId,
      prompt: promptContent,
      ...(data.participants !== undefined
        ? { participants: data.participants.map(mapParticipantSnapshot) }
        : {}),
    });
  });

  socket.on("battle:progress", (data: BattleProgressPayload) => {
    console.log("[battle:progress raw]", JSON.stringify(data, null, 2));

    if (!data?.participant) return;

    const participant = data.participant as BattleParticipant;

    store.updateParticipant(mapParticipant(participant));
  });

  socket.on("battle:input-result", (data) => {
    console.log("[battle:input-result]", data);

    if (data?.ok && data.data?.participant) {
      store.updateParticipant(mapParticipant(data.data.participant as BattleParticipant));
    }
  });

  socket.on("battle:eliminated", (data: BattleEliminatedPayload) => {
    store.eliminateParticipant(data.participantId);
  });

  socket.on("battle:finished", (data?: BattleFinishedPayload) => {
    useGameStore.getState().finishGame({
      nextWaitingStartsAt: data?.nextWaitingStartsAt ?? null,
    });
  });
};
