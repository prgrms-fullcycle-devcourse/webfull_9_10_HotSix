import { Injectable } from "@nestjs/common";
import { v7 as uuidv7 } from "uuid";
import type { BattleReadyDto } from "../dto/battle-ready.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleStateRepository } from "../repositories/battle-state.repository";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { PromptRepository } from "../repositories/prompt.repository";
import type { ConnectionRole, CurrentGameState } from "../types/current-game-state";

const WAITING_DURATION_SECONDS = 15 * 60;

@Injectable()
export class BattleService {
  constructor(
    private readonly battleStateRepository: BattleStateRepository,
    private readonly promptRepository: PromptRepository,
  ) {}

  async ensureCurrentGameState() {
    const currentGameState = await this.battleStateRepository.getCurrentGameState();

    if (currentGameState && currentGameState.phase !== "finished") {
      return currentGameState;
    }

    const waitingGameState = await this.createWaitingGameState(new Date());
    await this.battleStateRepository.saveCurrentGameState(waitingGameState);

    return waitingGameState;
  }

  createReadyConfirmation(payload: BattleReadyDto) {
    return {
      nickname: payload.nickname,
      status: "queued" as const,
    };
  }

  getWelcomeMessage() {
    return {
      message: "Keyboard Warrior Battle Royale server connected",
    };
  }

  async getCurrentGameState() {
    return this.battleStateRepository.getCurrentGameState();
  }

  getWaitingRemainingSeconds(currentGameState: CurrentGameState) {
    if (!currentGameState.waitingEndsAt) {
      return 0;
    }

    const remainingMilliseconds = new Date(currentGameState.waitingEndsAt).getTime() - Date.now();

    return Math.max(0, Math.ceil(remainingMilliseconds / 1000));
  }

  canStartCurrentGame(currentGameState: CurrentGameState) {
    return currentGameState.playerCount >= currentGameState.minPlayers;
  }

  buildStatePayload(currentGameState: CurrentGameState) {
    return {
      gameId: currentGameState.gameId,
      prompt: currentGameState.prompt,
      phase: currentGameState.phase,
      minPlayers: currentGameState.minPlayers,
      playerCount: currentGameState.playerCount,
      spectatorCount: currentGameState.spectatorCount,
      waitingEndsAt: currentGameState.waitingEndsAt,
      gameStartedAt: currentGameState.gameStartedAt,
      gameEndedAt: currentGameState.gameEndedAt,
    };
  }

  buildWaitingPayload(currentGameState: CurrentGameState) {
    return {
      gameId: currentGameState.gameId,
      phase: currentGameState.phase,
      prompt: {
        contentLength: currentGameState.prompt.contentLength,
        id: currentGameState.prompt.id,
        title: currentGameState.prompt.title,
      },
      remainingSeconds: this.getWaitingRemainingSeconds(currentGameState),
      waitingEndsAt: currentGameState.waitingEndsAt,
      minPlayers: currentGameState.minPlayers,
      playerCount: currentGameState.playerCount,
      spectatorCount: currentGameState.spectatorCount,
    };
  }

  async registerConnection() {
    const currentGameState = await this.ensureCurrentGameState();
    const assignedRole: ConnectionRole =
      currentGameState.phase === "in_progress" ? "spectator" : "player";
    const updatedGameState = await this.updateConnectionCount(currentGameState, assignedRole, 1);

    return {
      assignedRole,
      state: this.buildStatePayload(updatedGameState),
      waiting:
        updatedGameState.phase === "waiting" ? this.buildWaitingPayload(updatedGameState) : null,
    };
  }

  async unregisterConnection(assignedRole?: ConnectionRole) {
    if (!assignedRole) {
      return null;
    }

    const currentGameState = await this.getCurrentGameState();

    if (!currentGameState) {
      return null;
    }

    return this.updateConnectionCount(currentGameState, assignedRole, -1);
  }

  async markTenSecondNoticeSent(currentGameState: CurrentGameState) {
    const updatedGameState = {
      ...currentGameState,
      hasTenSecondNoticeSent: true,
      updatedAt: new Date().toISOString(),
    };

    await this.battleStateRepository.saveCurrentGameState(updatedGameState);

    return updatedGameState;
  }

  async startCurrentGame(currentGameState: CurrentGameState) {
    const startedAt = new Date().toISOString();
    const startedGameState = {
      ...currentGameState,
      phase: "in_progress" as const,
      gameStartedAt: startedAt,
      hasTenSecondNoticeSent: false,
      updatedAt: startedAt,
      waitingEndsAt: null,
      waitingStartedAt: null,
    };

    await this.battleStateRepository.saveCurrentGameState(startedGameState);

    return startedGameState;
  }

  async restartWaitingCountdown(currentGameState: CurrentGameState) {
    const now = new Date();
    const waitingStartedAt = now.toISOString();
    const waitingEndsAt = new Date(now.getTime() + WAITING_DURATION_SECONDS * 1000).toISOString();
    const restartedWaitingGameState = {
      ...currentGameState,
      hasTenSecondNoticeSent: false,
      updatedAt: waitingStartedAt,
      waitingEndsAt,
      waitingStartedAt,
    };

    await this.battleStateRepository.saveCurrentGameState(restartedWaitingGameState);

    return restartedWaitingGameState;
  }

  async finishCurrentGame() {
    const currentGameState = await this.getCurrentGameState();

    if (!currentGameState || currentGameState.phase !== "in_progress") {
      return null;
    }

    const finishedAt = new Date().toISOString();
    const finishedGameState = {
      ...currentGameState,
      phase: "finished" as const,
      gameEndedAt: finishedAt,
      updatedAt: finishedAt,
    };
    const nextWaitingGameState = await this.createWaitingGameState(new Date());

    await this.battleStateRepository.saveCurrentGameState(nextWaitingGameState);

    return {
      finishedGameState,
      nextWaitingGameState,
    };
  }

  private async createWaitingGameState(now: Date) {
    const gameId = uuidv7();
    const prompt = await this.promptRepository.getRandomPrompt();
    const waitingStartedAt = now.toISOString();
    const waitingEndsAt = new Date(now.getTime() + WAITING_DURATION_SECONDS * 1000).toISOString();

    const gameState = {
      createdAt: waitingStartedAt,
      gameEndedAt: null,
      gameStartedAt: null,
      gameId,
      hasTenSecondNoticeSent: false,
      phase: "waiting" as const,
      playerCount: 0,
      minPlayers: 4,
      prompt,
      spectatorCount: 0,
      updatedAt: waitingStartedAt,
      waitingEndsAt,
      waitingStartedAt,
    };

    return gameState;
  }

  private async updateConnectionCount(
    currentGameState: CurrentGameState,
    assignedRole: ConnectionRole,
    delta: number,
  ) {
    const playerCount =
      assignedRole === "player"
        ? Math.max(0, currentGameState.playerCount + delta)
        : currentGameState.playerCount;
    const spectatorCount =
      assignedRole === "spectator"
        ? Math.max(0, currentGameState.spectatorCount + delta)
        : currentGameState.spectatorCount;
    const updatedGameState = {
      ...currentGameState,
      playerCount,
      spectatorCount,
      updatedAt: new Date().toISOString(),
    };

    await this.battleStateRepository.saveCurrentGameState(updatedGameState);

    return updatedGameState;
  }
}
