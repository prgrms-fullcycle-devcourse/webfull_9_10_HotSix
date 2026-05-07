import type { Server, Socket } from "socket.io";

jest.mock("uuid", () => ({
  v7: jest.fn(() => "uuid-v7"),
}));

import { SOCKET_EVENTS } from "../src/common/constants/socket-events";
import { BattleGateway } from "../src/modules/battle/gateways/battle.gateway";
import type { BattleStateRepository } from "../src/modules/battle/repositories/battle-state.repository";
import type { PromptRepository } from "../src/modules/battle/repositories/prompt.repository";
import { BattleService } from "../src/modules/battle/services/battle.service";
import type { BattleBroadcastService } from "../src/modules/battle/services/battle-broadcast.service";
import type { BattleParticipantState } from "../src/modules/battle/types/battle-participant-state";
import type { CurrentGameState } from "../src/modules/battle/types/current-game-state";

const prompt = {
  content: "hello",
  contentLength: 5,
  id: 1,
  slug: "hello",
  title: "Hello",
};

function createGameState(overrides: Partial<CurrentGameState> = {}): CurrentGameState {
  return {
    createdAt: "2026-05-06T00:00:00.000Z",
    gameEndedAt: null,
    gameId: "game-1",
    gameStartedAt: "2026-05-06T00:01:00.000Z",
    hasTenSecondNoticeSent: false,
    minPlayers: 4,
    phase: "in_progress",
    playerCount: 1,
    prompt,
    spectatorCount: 0,
    updatedAt: "2026-05-06T00:01:00.000Z",
    waitingEndsAt: null,
    waitingStartedAt: null,
    ...overrides,
  };
}

function createParticipantState(
  overrides: Partial<BattleParticipantState> = {},
): BattleParticipantState {
  return {
    acceptedLength: 0,
    accuracy: 100,
    gameId: "game-1",
    lastInputAt: null,
    lastPenaltyIndex: null,
    life: 3,
    participantId: "socket-1",
    progressPercent: 0,
    role: "player",
    socketId: "socket-1",
    status: "playing",
    typoCount: 0,
    ...overrides,
  };
}

function createService(input: {
  currentGameState?: CurrentGameState | null;
  participantState?: BattleParticipantState | null;
  saveParticipantState?: jest.Mock;
}) {
  const saveParticipantState = input.saveParticipantState ?? jest.fn();
  const repository = {
    getCurrentGameState: jest.fn().mockResolvedValue(input.currentGameState ?? createGameState()),
    getParticipantState: jest.fn().mockResolvedValue(input.participantState ?? null),
    saveParticipantState,
  } as unknown as BattleStateRepository;

  return {
    repository,
    saveParticipantState,
    service: new BattleService(repository, {} as PromptRepository),
  };
}

function createServer() {
  const emit = jest.fn();
  const to = jest.fn(() => ({ emit }));

  return {
    emit,
    server: { to } as unknown as Server,
    to,
  };
}

function createSocket(overrides: { assignedRole?: "player" | "spectator" } = {}) {
  return {
    data: {
      assignedRole: overrides.assignedRole ?? "player",
      gameId: "game-1",
      participantId: "user-1",
    },
    id: "socket-1",
  } as unknown as Socket;
}

describe("BattleService input validation", () => {
  it("accepts a valid prefix and stores server-calculated progress", async () => {
    const { saveParticipantState, service } = createService({});

    const result = await service.validateInput({
      assignedRole: "player",
      cursorPosition: 3,
      gameId: "game-1",
      inputText: "hel",
      participantId: "socket-1",
      socketId: "socket-1",
      typedChars: 3,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected accepted input");
    expect(result.data).toMatchObject({
      acceptedLength: 3,
      accuracy: 100,
      isEliminated: false,
      isFinished: false,
      isTypo: false,
      life: 3,
      progressPercent: 60,
      typedLength: 3,
      typoIndex: null,
    });
    expect(saveParticipantState).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptedLength: 3,
        life: 3,
        progressPercent: 60,
        status: "playing",
      }),
    );
  });

  it("penalizes the first typo at a position", async () => {
    const { saveParticipantState, service } = createService({});

    const result = await service.validateInput({
      assignedRole: "player",
      cursorPosition: 3,
      gameId: "game-1",
      inputText: "hez",
      participantId: "socket-1",
      socketId: "socket-1",
      typedChars: 3,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected accepted input");
    expect(result.data).toMatchObject({
      acceptedLength: 2,
      isTypo: true,
      life: 2,
      progressPercent: 40,
      typoIndex: 2,
    });
    expect(saveParticipantState).toHaveBeenCalledWith(
      expect.objectContaining({
        lastPenaltyIndex: 2,
        life: 2,
        typoCount: 1,
      }),
    );
  });

  it("does not apply the same typo penalty twice", async () => {
    const { saveParticipantState, service } = createService({
      participantState: createParticipantState({
        lastPenaltyIndex: 2,
        life: 2,
        typoCount: 1,
      }),
    });

    const result = await service.validateInput({
      assignedRole: "player",
      cursorPosition: 3,
      gameId: "game-1",
      inputText: "hez",
      participantId: "socket-1",
      socketId: "socket-1",
      typedChars: 3,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected accepted input");
    expect(result.data.life).toBe(2);
    expect(saveParticipantState).toHaveBeenCalledWith(
      expect.objectContaining({
        lastPenaltyIndex: 2,
        life: 2,
        typoCount: 1,
      }),
    );
  });

  it("marks a player as eliminated when life reaches zero", async () => {
    const { saveParticipantState, service } = createService({
      participantState: createParticipantState({
        life: 1,
      }),
    });

    const result = await service.validateInput({
      assignedRole: "player",
      cursorPosition: 3,
      gameId: "game-1",
      inputText: "hez",
      participantId: "socket-1",
      socketId: "socket-1",
      typedChars: 3,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected accepted input");
    expect(result.data.isEliminated).toBe(true);
    expect(saveParticipantState).toHaveBeenCalledWith(
      expect.objectContaining({
        life: 0,
        status: "eliminated",
      }),
    );
  });

  it("marks exact completion as finished", async () => {
    const { saveParticipantState, service } = createService({});

    const result = await service.validateInput({
      assignedRole: "player",
      cursorPosition: 5,
      gameId: "game-1",
      inputText: "hello",
      participantId: "socket-1",
      socketId: "socket-1",
      typedChars: 5,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected accepted input");
    expect(result.data).toMatchObject({
      acceptedLength: 5,
      isFinished: true,
      progressPercent: 100,
    });
    expect(saveParticipantState).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "finished",
      }),
    );
  });

  it("rejects spectator input", async () => {
    const { saveParticipantState, service } = createService({});

    const result = await service.validateInput({
      assignedRole: "spectator",
      cursorPosition: 5,
      gameId: "game-1",
      inputText: "hello",
      participantId: "socket-1",
      socketId: "socket-1",
      typedChars: 5,
    });

    expect(result).toMatchObject({
      code: "NOT_PLAYER",
      ok: false,
    });
    expect(saveParticipantState).not.toHaveBeenCalled();
  });

  it("rejects malformed input payloads before updating progress", async () => {
    const { repository, saveParticipantState, service } = createService({});

    const result = await service.validateInput({
      assignedRole: "player",
      cursorPosition: 4,
      gameId: "game-1",
      inputText: "hel",
      participantId: "socket-1",
      socketId: "socket-1",
      typedChars: 4,
    });

    expect(result).toMatchObject({
      code: "INVALID_INPUT_PAYLOAD",
      ok: false,
    });
    expect(repository.getCurrentGameState).not.toHaveBeenCalled();
    expect(saveParticipantState).not.toHaveBeenCalled();
  });

  it("hides prompt content before the game starts", () => {
    const { service } = createService({
      currentGameState: createGameState({
        gameStartedAt: null,
        phase: "waiting",
        waitingEndsAt: "2026-05-06T00:15:00.000Z",
        waitingStartedAt: "2026-05-06T00:00:00.000Z",
      }),
    });

    const payload = service.buildStatePayload(
      createGameState({
        gameStartedAt: null,
        phase: "waiting",
        waitingEndsAt: "2026-05-06T00:15:00.000Z",
        waitingStartedAt: "2026-05-06T00:00:00.000Z",
      }),
    );

    expect(payload.prompt).toEqual({
      contentLength: 5,
      id: 1,
      title: "Hello",
    });
  });
});

describe("BattleGateway input handling", () => {
  it("broadcasts progress after accepted input", async () => {
    const participant = createParticipantState({
      acceptedLength: 3,
      progressPercent: 60,
    });
    const validateInput = jest.fn().mockResolvedValue({
      data: {
        gameId: "game-1",
        isEliminated: false,
        participant,
      },
      ok: true,
    });
    const gateway = new BattleGateway(
      { validateInput } as unknown as BattleService,
      {} as BattleBroadcastService,
    );
    const { emit, server, to } = createServer();
    gateway.server = server;

    const result = await gateway.handleInput(
      {
        cursorPosition: 3,
        inputText: "hel",
        typedChars: 3,
      },
      createSocket(),
    );

    expect(validateInput).toHaveBeenCalledWith({
      assignedRole: "player",
      cursorPosition: 3,
      gameId: "game-1",
      inputText: "hel",
      participantId: "user-1",
      socketId: "socket-1",
      typedChars: 3,
    });
    expect(to).toHaveBeenCalledWith("battle:game-1");
    expect(emit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_PROGRESS, {
      gameId: "game-1",
      participant,
    });
    expect(result).toMatchObject({
      event: SOCKET_EVENTS.BATTLE_INPUT_RESULT,
    });
  });

  it("broadcasts elimination after accepted input removes the last life", async () => {
    const participant = createParticipantState({
      life: 0,
      status: "eliminated",
    });
    const validateInput = jest.fn().mockResolvedValue({
      data: {
        gameId: "game-1",
        isEliminated: true,
        participant,
      },
      ok: true,
    });
    const gateway = new BattleGateway(
      { validateInput } as unknown as BattleService,
      {} as BattleBroadcastService,
    );
    const { emit, server } = createServer();
    gateway.server = server;

    await gateway.handleInput(
      {
        cursorPosition: 3,
        inputText: "hez",
        typedChars: 3,
      },
      createSocket(),
    );

    expect(emit).toHaveBeenCalledWith(SOCKET_EVENTS.BATTLE_ELIMINATED, {
      gameId: "game-1",
      participantId: "socket-1",
      reason: "typo",
      socketId: "socket-1",
      userId: "socket-1",
    });
  });
});

describe("BattleService socket auth and connection dedupe", () => {
  it("verifies socket auth tokens and refreshes their TTL", async () => {
    const getSocketAuthSession = jest.fn().mockResolvedValue({
      issuedAt: "2026-05-06T00:00:00.000Z",
      userId: "user-1",
    });
    const refreshSocketAuthSession = jest.fn();
    const service = new BattleService(
      {
        getSocketAuthSession,
        refreshSocketAuthSession,
      } as unknown as BattleStateRepository,
      {} as PromptRepository,
    );

    const session = await service.verifySocketAuthToken("ws_tk_123");

    expect(session).toEqual({
      issuedAt: "2026-05-06T00:00:00.000Z",
      userId: "user-1",
    });
    expect(getSocketAuthSession).toHaveBeenCalledWith("ws_tk_123");
    expect(refreshSocketAuthSession).toHaveBeenCalledWith("ws_tk_123");
  });

  it("does not increment player count for a duplicate waiting connection from the same user", async () => {
    const currentGameState = createGameState({
      gameStartedAt: null,
      phase: "waiting",
      playerCount: 1,
      waitingEndsAt: "2026-05-06T00:15:00.000Z",
      waitingStartedAt: "2026-05-06T00:00:00.000Z",
    });
    const saveActiveConnection = jest.fn();
    const saveCurrentGameState = jest.fn();
    const service = new BattleService(
      {
        getActiveConnection: jest.fn().mockResolvedValue({
          assignedRole: "player",
          gameId: "game-1",
          participantId: "user-1",
          socketId: "old-socket",
        }),
        getCurrentGameState: jest.fn().mockResolvedValue(currentGameState),
        saveActiveConnection,
        saveCurrentGameState,
      } as unknown as BattleStateRepository,
      {} as PromptRepository,
    );

    const result = await service.registerConnection({
      participantId: "user-1",
      socketId: "new-socket",
    });

    expect(result.assignedRole).toBe("player");
    expect(result.state.playerCount).toBe(1);
    expect(saveCurrentGameState).not.toHaveBeenCalled();
    expect(saveActiveConnection).toHaveBeenCalledWith({
      assignedRole: "player",
      gameId: "game-1",
      participantId: "user-1",
      socketId: "new-socket",
    });
  });

  it("ignores an old socket disconnect after the same user reconnects", async () => {
    const saveCurrentGameState = jest.fn();
    const deleteActiveConnection = jest.fn();
    const service = new BattleService(
      {
        deleteActiveConnection,
        getActiveConnection: jest.fn().mockResolvedValue({
          assignedRole: "player",
          gameId: "game-1",
          participantId: "user-1",
          socketId: "new-socket",
        }),
        getCurrentGameState: jest.fn().mockResolvedValue(
          createGameState({
            gameStartedAt: null,
            phase: "waiting",
            playerCount: 1,
            waitingEndsAt: "2026-05-06T00:15:00.000Z",
            waitingStartedAt: "2026-05-06T00:00:00.000Z",
          }),
        ),
        saveCurrentGameState,
      } as unknown as BattleStateRepository,
      {} as PromptRepository,
    );

    const result = await service.unregisterConnection({
      assignedRole: "player",
      gameId: "game-1",
      participantId: "user-1",
      socketId: "old-socket",
    });

    expect(result).toBeNull();
    expect(deleteActiveConnection).not.toHaveBeenCalled();
    expect(saveCurrentGameState).not.toHaveBeenCalled();
  });
});
