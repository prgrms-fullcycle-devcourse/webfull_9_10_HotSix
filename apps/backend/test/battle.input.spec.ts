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
import type { BattleParticipantState } from "../src/modules/battle/types/battle-participant-state";
import type { CurrentGameState } from "../src/modules/battle/types/current-game-state";
import type { UsersService } from "../src/modules/users/users.service";

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
    minPlayers: 1,
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
    wpm: 0,
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
  const updateScoreboard = jest.fn().mockResolvedValue(undefined);
  const repository = {
    getCurrentGameState: jest.fn().mockResolvedValue(input.currentGameState ?? createGameState()),
    getParticipantState: jest.fn().mockResolvedValue(input.participantState ?? null),
    saveParticipantState,
    updateScoreboard,
  } as unknown as BattleStateRepository;

  return {
    repository,
    saveParticipantState,
    service: new BattleService(
      repository,
      {} as PromptRepository,
      createUsersServiceMock(),
      createBattleResultRepositoryMock(),
    ),
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
      participantId: "user-1",
    },
    id: "socket-1",
  } as unknown as Socket;
}

function createUsersServiceMock(overrides: Partial<UsersService> = {}) {
  return {
    recordBattleResults: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as UsersService;
}

function createBattleResultRepositoryMock(overrides: Partial<BattleResultRepository> = {}) {
  return {
    saveBattleGameResult: jest.fn().mockResolvedValue({ id: 101 }),
    ...overrides,
  } as unknown as BattleResultRepository;
}

describe("BattleService input validation", () => {
  it("accepts a valid prefix and stores server-calculated progress", async () => {
    const { saveParticipantState, service } = createService({});

    const result = await service.validateInput({
      assignedRole: "player",
      gameId: "game-1",
      participantId: "socket-1",
      socketId: "socket-1",
      typedText: "hel",
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
      gameId: "game-1",
      participantId: "socket-1",
      socketId: "socket-1",
      typedText: "hez",
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

  it("applies repeated typo penalties at the same position", async () => {
    const { saveParticipantState, service } = createService({
      participantState: createParticipantState({
        lastPenaltyIndex: 2,
        life: 2,
        typoCount: 1,
      }),
    });

    const result = await service.validateInput({
      assignedRole: "player",
      gameId: "game-1",
      participantId: "socket-1",
      socketId: "socket-1",
      typedText: "hez",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected accepted input");
    expect(result.data.life).toBe(1);
    expect(saveParticipantState).toHaveBeenCalledWith(
      expect.objectContaining({
        lastPenaltyIndex: 2,
        life: 1,
        typoCount: 2,
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
      gameId: "game-1",
      participantId: "socket-1",
      socketId: "socket-1",
      typedText: "hez",
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
      gameId: "game-1",
      participantId: "socket-1",
      socketId: "socket-1",
      typedText: "hello",
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
      gameId: "game-1",
      participantId: "socket-1",
      socketId: "socket-1",
      typedText: "hello",
    });

    expect(result).toMatchObject({
      code: "NOT_PLAYER",
      ok: false,
    });
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

describe("BattleService game finish rules", () => {
  function createFinishService(input: {
    currentGameState?: CurrentGameState;
    participants: BattleParticipantState[];
  }) {
    const currentGameState = input.currentGameState ?? createGameState();
    const repository = {
      acquireGameFinishLock: jest.fn().mockResolvedValue(true),
      getCurrentGameState: jest.fn().mockResolvedValue(currentGameState),
      getPlayerParticipantStates: jest.fn().mockResolvedValue(input.participants),
      removeLobbyEntry: jest.fn().mockResolvedValue(undefined),
      saveCurrentGameState: jest.fn(),
      saveGameResult: jest.fn(),
    } as unknown as BattleStateRepository;

    const usersService = createUsersServiceMock();
    const battleResultRepository = createBattleResultRepositoryMock();

    return {
      battleResultRepository,
      repository,
      service: new BattleService(
        repository,
        {} as PromptRepository,
        usersService,
        battleResultRepository,
      ),
      usersService,
    };
  }

  it("finishes when a player reaches 100 percent and ranks the rest by progress", async () => {
    const { battleResultRepository, repository, service, usersService } = createFinishService({
      participants: [
        createParticipantState({
          acceptedLength: 5,
          finishedAt: "2026-05-06T00:02:00.000Z",
          participantId: "user-1",
          progressPercent: 100,
          status: "finished",
        }),
        createParticipantState({
          acceptedLength: 2,
          participantId: "user-2",
          progressPercent: 40,
        }),
        createParticipantState({
          acceptedLength: 4,
          participantId: "user-3",
          progressPercent: 80,
        }),
      ],
    });

    const result = await service.finishCurrentGameIfNeeded();

    expect(result?.result).toMatchObject({
      reason: "completed",
      winnerParticipantId: "user-1",
      rankings: [
        expect.objectContaining({ isWinner: true, participantId: "user-1", rank: 1 }),
        expect.objectContaining({ participantId: "user-3", rank: 2 }),
        expect.objectContaining({ participantId: "user-2", rank: 3 }),
      ],
    });
    expect(repository.saveCurrentGameState).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "finished",
        finishReason: "completed",
        winnerParticipantId: "user-1",
        nextWaitingStartsAt: expect.any(String),
      }),
    );
    const savedGameState = (repository.saveCurrentGameState as jest.Mock).mock.calls[0][0];
    expect(
      new Date(savedGameState.nextWaitingStartsAt).getTime() -
        new Date(savedGameState.gameEndedAt).getTime(),
    ).toBe(15_000);
    expect(repository.saveGameResult).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "completed",
        winnerParticipantId: "user-1",
      }),
    );
    expect(battleResultRepository.saveBattleGameResult).toHaveBeenCalledWith({
      currentGameState: expect.objectContaining({ gameId: "game-1" }),
      result: expect.objectContaining({
        reason: "completed",
        winnerParticipantId: "user-1",
      }),
    });
    expect(usersService.recordBattleResults).toHaveBeenCalledWith([
      expect.objectContaining({
        acceptedLength: 5,
        isWinner: true,
        rank: 1,
        userId: "user-1",
      }),
      expect.objectContaining({
        acceptedLength: 4,
        isWinner: false,
        rank: 2,
        userId: "user-3",
      }),
      expect.objectContaining({
        acceptedLength: 2,
        isWinner: false,
        rank: 3,
        userId: "user-2",
      }),
    ]);
  });

  it("finishes when all players are eliminated and ranks by last elimination", async () => {
    const { service } = createFinishService({
      participants: [
        createParticipantState({
          eliminatedAt: "2026-05-06T00:03:00.000Z",
          participantId: "user-1",
          status: "eliminated",
        }),
        createParticipantState({
          eliminatedAt: "2026-05-06T00:05:00.000Z",
          participantId: "user-2",
          status: "eliminated",
        }),
        createParticipantState({
          eliminatedAt: "2026-05-06T00:04:00.000Z",
          participantId: "user-3",
          status: "eliminated",
        }),
      ],
    });

    const result = await service.finishCurrentGameIfNeeded();

    expect(result?.result).toMatchObject({
      reason: "all_eliminated",
      winnerParticipantId: "user-2",
      rankings: [
        expect.objectContaining({ finalStatus: "winner", participantId: "user-2", rank: 1 }),
        expect.objectContaining({ finalStatus: "eliminated", participantId: "user-3", rank: 2 }),
        expect.objectContaining({ finalStatus: "eliminated", participantId: "user-1", rank: 3 }),
      ],
    });
  });

  it("finishes after the 15 minute time limit and ranks by progress", async () => {
    const startedAt = new Date(Date.now() - 15 * 60 * 1000 - 1000).toISOString();
    const { service } = createFinishService({
      currentGameState: createGameState({
        gameStartedAt: startedAt,
      }),
      participants: [
        createParticipantState({
          acceptedLength: 1,
          participantId: "user-1",
          progressPercent: 20,
        }),
        createParticipantState({
          acceptedLength: 4,
          participantId: "user-2",
          progressPercent: 80,
        }),
      ],
    });

    const result = await service.finishCurrentGameIfNeeded();

    expect(result?.result).toMatchObject({
      reason: "time_limit",
      winnerParticipantId: "user-2",
      rankings: [
        expect.objectContaining({ participantId: "user-2", rank: 1 }),
        expect.objectContaining({ participantId: "user-1", rank: 2 }),
      ],
    });
  });

  it("opens a new waiting game only after the 15 second finished delay", async () => {
    const finishedGameState = createGameState({
      gameEndedAt: "2026-05-06T00:16:00.000Z",
      nextWaitingStartsAt: new Date(Date.now() - 1000).toISOString(),
      phase: "finished",
    });
    const repository = {
      saveCurrentGameState: jest.fn(),
    } as unknown as BattleStateRepository;
    const promptRepository = {
      getRandomPrompt: jest.fn().mockResolvedValue(prompt),
    } as unknown as PromptRepository;
    const service = new BattleService(
      repository,
      promptRepository,
      createUsersServiceMock(),
      createBattleResultRepositoryMock(),
    );

    const nextGameState = await service.startNextWaitingGameIfReady(finishedGameState);

    expect(nextGameState).toMatchObject({
      phase: "waiting",
      waitingEndsAt: expect.any(String),
    });
    expect(repository.saveCurrentGameState).toHaveBeenCalledWith(nextGameState);
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
      {
        finishCurrentGameIfNeeded: jest.fn().mockResolvedValue(null),
        validateInput,
      } as unknown as BattleService,
      {} as BattleBroadcastService,
    );
    const { emit, server, to } = createServer();
    gateway.server = server;

    const result = await gateway.handleInput(
      {
        gameId: "game-1",
        typedText: "hel",
      },
      createSocket(),
    );

    expect(validateInput).toHaveBeenCalledWith({
      assignedRole: "player",
      cursorPosition: undefined,
      gameId: "game-1",
      participantId: "user-1",
      socketId: "socket-1",
      typedText: "hel",
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
      {
        finishCurrentGameIfNeeded: jest.fn().mockResolvedValue(null),
        validateInput,
      } as unknown as BattleService,
      {} as BattleBroadcastService,
    );
    const { emit, server } = createServer();
    gateway.server = server;

    await gateway.handleInput(
      {
        gameId: "game-1",
        typedText: "hez",
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
      createUsersServiceMock(),
      createBattleResultRepositoryMock(),
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
      createUsersServiceMock(),
      createBattleResultRepositoryMock(),
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
      createUsersServiceMock(),
      createBattleResultRepositoryMock(),
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
