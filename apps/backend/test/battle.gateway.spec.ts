import type { Server, Socket } from "socket.io";

jest.mock("../src/common/uuid", () => ({
  createUuidV7: jest.fn(() => "uuid-v7"),
}));

import { SOCKET_EVENTS } from "../src/common/constants/socket-events";
import { BattleGateway } from "../src/modules/battle/gateways/battle.gateway";
import type { BattleResultRepository } from "../src/modules/battle/repositories/battle-result.repository";
import type { BattleStateRepository } from "../src/modules/battle/repositories/battle-state.repository";
import type { PromptRepository } from "../src/modules/battle/repositories/prompt.repository";
import { BattleService } from "../src/modules/battle/services/battle.service";
import type { BattleBroadcastService } from "../src/modules/battle/services/battle-broadcast.service";
import type { CurrentGameState } from "../src/modules/battle/types/current-game-state";
import type { UsersService } from "../src/modules/users/users.service";

const prompt = {
  content: "hello battle",
  contentLength: 12,
  id: 1,
  slug: "hello-battle",
  title: "Hello Battle",
};

function createGameState(overrides: Partial<CurrentGameState> = {}): CurrentGameState {
  return {
    createdAt: "2026-05-06T00:00:00.000Z",
    gameEndedAt: null,
    gameId: "game-1",
    gameStartedAt: null,
    hasTenSecondNoticeSent: false,
    minPlayers: 4,
    phase: "waiting",
    playerCount: 1,
    prompt,
    spectatorCount: 0,
    updatedAt: "2026-05-06T00:00:00.000Z",
    waitingEndsAt: "2026-05-06T00:15:00.000Z",
    waitingStartedAt: "2026-05-06T00:00:00.000Z",
    ...overrides,
  };
}

function createSocket() {
  const broadcastEmit = jest.fn();
  const broadcastTo = jest.fn(() => ({ emit: broadcastEmit }));
  const emit = jest.fn();
  const join = jest.fn();
  const socket = {
    broadcast: {
      emit: broadcastEmit,
      to: broadcastTo,
    },
    data: {},
    emit,
    handshake: {
      auth: {
        token: "ws_tk_123",
      },
    },
    id: "socket-1",
    join,
  } as unknown as Socket;

  return { broadcastEmit, broadcastTo, emit, join, socket };
}

function createServer() {
  const emit = jest.fn();
  const to = jest.fn(() => ({ emit }));
  const server = { to } as unknown as Server;

  return { emit, server, to };
}

function createUsersServiceMock() {
  return {
    recordBattleResults: jest.fn().mockResolvedValue(undefined),
  } as unknown as UsersService;
}

function createBattleResultRepositoryMock() {
  return {
    saveBattleGameResult: jest.fn().mockResolvedValue({ id: 101 }),
  } as unknown as BattleResultRepository;
}

describe("BattleGateway", () => {
  it("registers the Socket.IO server for background cycle broadcasts", () => {
    const battleService = {} as BattleService;
    const setServer = jest.fn();
    const battleBroadcastService = { setServer } as unknown as BattleBroadcastService;
    const server = {} as Server;
    const gateway = new BattleGateway(battleService, battleBroadcastService);

    gateway.afterInit(server);

    expect(setServer).toHaveBeenCalledWith(server);
  });

  it("sends the current state immediately when a player connects during waiting", async () => {
    const state = createGameState({ playerCount: 2 });
    const waiting = {
      gameId: state.gameId,
      minPlayers: state.minPlayers,
      phase: state.phase,
      playerCount: state.playerCount,
      prompt: {
        contentLength: prompt.contentLength,
        id: prompt.id,
        title: prompt.title,
      },
      remainingSeconds: 900,
      spectatorCount: state.spectatorCount,
      waitingEndsAt: state.waitingEndsAt,
    };
    const registerConnection = jest.fn().mockResolvedValue({
      assignedRole: "player",
      state,
      waiting,
    });
    const getWelcomeMessage = jest.fn(() => ({ message: "connected" }));
    const verifySocketAuthToken = jest.fn().mockResolvedValue({ userId: "user-1" });
    const battleService = {
      getWelcomeMessage,
      registerConnection,
      verifySocketAuthToken,
    } as unknown as BattleService;
    const gateway = new BattleGateway(battleService, {} as BattleBroadcastService);
    const { broadcastEmit, broadcastTo, emit, join, socket } = createSocket();

    await gateway.handleConnection(socket);

    expect(verifySocketAuthToken).toHaveBeenCalledWith("ws_tk_123");
    expect(registerConnection).toHaveBeenCalledWith({
      participantId: "user-1",
      socketId: "socket-1",
    });
    expect(socket.data).toMatchObject({
      assignedRole: "player",
      gameId: state.gameId,
      participantId: "user-1",
      userId: "user-1",
    });
    expect(join).toHaveBeenCalledWith("battle:game-1");
    expect(emit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_WELCOME, { message: "connected" });
    expect(emit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_STATE, state);
    expect(emit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_WAITING, waiting);
    expect(broadcastTo).toHaveBeenCalledWith("battle:game-1");
    expect(broadcastEmit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_WAITING, waiting);
  });

  it("updates the room when a waiting player disconnects", async () => {
    const updatedGameState = createGameState({ playerCount: 1 });
    const waiting = {
      gameId: updatedGameState.gameId,
      minPlayers: updatedGameState.minPlayers,
      phase: updatedGameState.phase,
      playerCount: updatedGameState.playerCount,
      prompt: {
        contentLength: prompt.contentLength,
        id: prompt.id,
        title: prompt.title,
      },
      remainingSeconds: 899,
      spectatorCount: updatedGameState.spectatorCount,
      waitingEndsAt: updatedGameState.waitingEndsAt,
    };
    const unregisterConnection = jest.fn().mockResolvedValue(updatedGameState);
    const buildWaitingPayload = jest.fn(() => waiting);
    const battleService = {
      buildWaitingPayload,
      unregisterConnection,
    } as unknown as BattleService;
    const gateway = new BattleGateway(battleService, {} as BattleBroadcastService);
    const { emit, server, to } = createServer();
    const { socket } = createSocket();
    gateway.server = server;
    socket.data.assignedRole = "player";
    socket.data.gameId = "game-1";
    socket.data.participantId = "user-1";

    await gateway.handleDisconnect(socket);

    expect(unregisterConnection).toHaveBeenCalledWith({
      assignedRole: "player",
      gameId: "game-1",
      participantId: "user-1",
      socketId: "socket-1",
    });
    expect(to).toHaveBeenCalledWith("battle:game-1");
    expect(emit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_WAITING, waiting);
  });

  it("notifies the room when an active player disconnects during a game", async () => {
    const updatedGameState = createGameState({
      gameStartedAt: "2026-05-06T00:15:00.000Z",
      phase: "in_progress",
      playerCount: 3,
      waitingEndsAt: null,
      waitingStartedAt: null,
    });
    const statePayload = { ...updatedGameState };
    const unregisterConnection = jest.fn().mockResolvedValue(updatedGameState);
    const buildStatePayload = jest.fn(() => statePayload);
    const battleService = {
      buildStatePayload,
      finishCurrentGameIfNeeded: jest.fn().mockResolvedValue(null),
      unregisterConnection,
      handleDisconnectUser: jest.fn(),
    } as unknown as BattleService;
    const gateway = new BattleGateway(battleService, {} as BattleBroadcastService);
    const { emit, server } = createServer();
    const { socket } = createSocket();
    gateway.server = server;
    socket.data.assignedRole = "player";
    socket.data.gameId = "game-1";
    socket.data.userId = "user-1";

    await gateway.handleDisconnect(socket);

    expect(emit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_ELIMINATED, {
      gameId: "game-1",
      reason: "disconnected",
      socketId: "socket-1",
      userId: "user-1",
    });
    expect(emit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_STATE, statePayload);
  });

  it("scopes ready broadcasts to the active game room", () => {
    const confirmed = { nickname: "Jay", status: "queued" as const };
    const createReadyConfirmation = jest.fn(() => confirmed);
    const battleService = {
      createReadyConfirmation,
    } as unknown as BattleService;
    const gateway = new BattleGateway(battleService, {} as BattleBroadcastService);
    const { broadcastEmit, broadcastTo, socket } = createSocket();
    socket.data.gameId = "game-1";

    const result = gateway.handleReady({ nickname: "Jay" }, socket);

    expect(broadcastTo).toHaveBeenCalledWith("battle:game-1");
    expect(broadcastEmit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_PLAYER_READY, {
      nickname: "Jay",
    });
    expect(result).toEqual({
      data: confirmed,
      event: SOCKET_EVENTS.BATTLE_READY_CONFIRMED,
    });
  });
});

describe("BattleService socket payloads", () => {
  it("does not expose prompt content while the game is waiting", () => {
    const service = new BattleService(
      {} as BattleStateRepository,
      {} as PromptRepository,
      createUsersServiceMock(),
      createBattleResultRepositoryMock(),
    );

    const payload = service.buildStatePayload(createGameState());

    expect(payload.prompt).toEqual({
      contentLength: prompt.contentLength,
      id: prompt.id,
      title: prompt.title,
    });
  });

  it("exposes prompt content after the game starts", () => {
    const service = new BattleService(
      {} as BattleStateRepository,
      {} as PromptRepository,
      createUsersServiceMock(),
      createBattleResultRepositoryMock(),
    );

    const payload = service.buildStatePayload(
      createGameState({
        gameStartedAt: "2026-05-06T00:15:00.000Z",
        phase: "in_progress",
        waitingEndsAt: null,
        waitingStartedAt: null,
      }),
    );

    expect(payload.prompt).toEqual(prompt);
  });

  it("does not decrement the next game when an old socket disconnects late", async () => {
    const getCurrentGameState = jest.fn().mockResolvedValue(createGameState({ gameId: "game-2" }));
    const saveCurrentGameState = jest.fn();
    const service = new BattleService(
      {
        getCurrentGameState,
        saveCurrentGameState,
      } as unknown as BattleStateRepository,
      {} as PromptRepository,
      createUsersServiceMock(),
      createBattleResultRepositoryMock(),
    );

    const result = await service.unregisterConnection({
      assignedRole: "player",
      gameId: "game-1",
    });

    expect(result).toBeNull();
    expect(saveCurrentGameState).not.toHaveBeenCalled();
  });
});
