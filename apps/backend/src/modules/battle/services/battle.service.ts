import { Injectable, Logger } from "@nestjs/common";
import { createUuidV7 } from "../../../common/uuid";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { UsersService } from "../../users/users.service";
import type { BattleReadyDto } from "../dto/battle-ready.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleResultRepository } from "../repositories/battle-result.repository";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleStateRepository } from "../repositories/battle-state.repository";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { PromptRepository } from "../repositories/prompt.repository";
import type {
  BattleFinishReason,
  BattleGameResult,
  BattleRankingEntry,
} from "../types/battle-game-result";
import type { BattleParticipantState } from "../types/battle-participant-state";
import type { ConnectionRole, CurrentGameState } from "../types/current-game-state";

// const WAITING_DURATION_SECONDS = 15 * 60;
const WAITING_DURATION_SECONDS = 30;
const GAME_DURATION_SECONDS = 15 * 60;
const FINISHED_DURATION_SECONDS = 30;
const FINISH_LOCK_TTL_SECONDS = FINISHED_DURATION_SECONDS + 10;
const DEFAULT_PLAYER_LIFE = 3;

type BattleInputValidationInput = {
  assignedRole?: ConnectionRole | undefined;
  cursorPosition?: number | undefined;
  gameId: string;
  participantId: string;
  socketId: string;
  typedText: string;
};

type BattleConnectionInput = {
  participantId: string;
  socketId: string;
};

type BattleDisconnectionInput = {
  assignedRole?: ConnectionRole | undefined;
  gameId?: string | undefined;
  participantId?: string | undefined;
  socketId?: string | undefined;
};

type BattleInputRejectedResult = {
  code: string;
  message: string;
  ok: false;
};

type BattleInputAcceptedResult = {
  data: {
    acceptedLength: number;
    accuracy: number;
    expectedLength: number;
    gameId: string;
    isEliminated: boolean;
    isFinished: boolean;
    isTypo: boolean;
    life: number;
    participant: BattleParticipantState;
    progressPercent: number;
    typedLength: number;
    typoIndex: null | number;
  };
  ok: true;
};

export type BattleInputValidationResult = BattleInputAcceptedResult | BattleInputRejectedResult;

export type BattleFinishedResult = {
  finishedGameState: CurrentGameState;
  result: BattleGameResult;
};

@Injectable()
export class BattleService {
  private readonly logger = new Logger(BattleService.name);

  constructor(
    private readonly battleStateRepository: BattleStateRepository,
    private readonly promptRepository: PromptRepository,
    private readonly usersService: UsersService,
    private readonly battleResultRepository: BattleResultRepository,
  ) {}

  async ensureCurrentGameState() {
    const currentGameState = await this.battleStateRepository.getCurrentGameState();

    if (currentGameState) {
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

  async verifySocketAuthToken(token?: string) {
    if (!token) {
      return null;
    }

    const session = await this.battleStateRepository.getSocketAuthSession(token);

    if (!session?.userId) {
      return null;
    }

    await this.battleStateRepository.refreshSocketAuthSession(token);

    return session;
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
    console.log("[STATE PAYLOAD]", {
      minPlayers: currentGameState.minPlayers,
      playerCount: currentGameState.playerCount,
      phase: currentGameState.phase,
      waitingEndsAt: currentGameState.waitingEndsAt,
    });
    return {
      gameId: currentGameState.gameId,
      prompt:
        currentGameState.phase === "waiting"
          ? {
              contentLength: currentGameState.prompt.contentLength,
              id: currentGameState.prompt.id,
              title: currentGameState.prompt.title,
            }
          : currentGameState.prompt,
      phase: currentGameState.phase,
      minPlayers: currentGameState.minPlayers,
      playerCount: currentGameState.playerCount,
      spectatorCount: currentGameState.spectatorCount,
      waitingEndsAt: currentGameState.waitingEndsAt,
      gameStartedAt: currentGameState.gameStartedAt,
      gameEndedAt: currentGameState.gameEndedAt,
      finishReason: currentGameState.finishReason ?? null,
      nextWaitingStartsAt: currentGameState.nextWaitingStartsAt ?? null,
      rankings: currentGameState.rankings ?? [],
      winnerParticipantId: currentGameState.winnerParticipantId ?? null,
    };
  }

  buildFinishedPayload(currentGameState: CurrentGameState) {
    return {
      finishedAt: currentGameState.gameEndedAt,
      gameId: currentGameState.gameId,
      nextWaitingStartsAt: currentGameState.nextWaitingStartsAt ?? null,
      rankings: currentGameState.rankings ?? [],
      reason: currentGameState.finishReason ?? null,
      winnerParticipantId: currentGameState.winnerParticipantId ?? null,
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

  async registerConnection(input: BattleConnectionInput) {
    const currentGameState = await this.ensureCurrentGameState();
    const activeConnection = await this.battleStateRepository.getActiveConnection(
      currentGameState.gameId,
      input.participantId,
    );

    if (activeConnection) {
      const refreshedConnection = {
        ...activeConnection,
        socketId: input.socketId,
      };

      await this.battleStateRepository.saveActiveConnection(refreshedConnection);

      return {
        assignedRole: refreshedConnection.assignedRole,
        state: this.buildStatePayload(currentGameState),
        waiting:
          currentGameState.phase === "waiting" ? this.buildWaitingPayload(currentGameState) : null,
      };
    }

    const assignedRole: ConnectionRole =
      currentGameState.phase === "waiting" ? "player" : "spectator";
    const updatedGameState = await this.updateConnectionCount(currentGameState, assignedRole, 1);
    await this.battleStateRepository.saveActiveConnection({
      assignedRole,
      gameId: updatedGameState.gameId,
      participantId: input.participantId,
      socketId: input.socketId,
    });

    return {
      assignedRole,
      state: this.buildStatePayload(updatedGameState),
      waiting:
        updatedGameState.phase === "waiting" ? this.buildWaitingPayload(updatedGameState) : null,
    };
  }

  async unregisterConnection(input: BattleDisconnectionInput = {}) {
    if (!input.assignedRole) {
      return null;
    }

    const currentGameState = await this.getCurrentGameState();

    if (!currentGameState) {
      return null;
    }

    if (input.gameId && input.gameId !== currentGameState.gameId) {
      return null;
    }

    let assignedRole = input.assignedRole;

    if (input.participantId && input.socketId) {
      const activeConnection = await this.battleStateRepository.getActiveConnection(
        currentGameState.gameId,
        input.participantId,
      );

      if (!activeConnection || activeConnection.socketId !== input.socketId) {
        return null;
      }

      assignedRole = activeConnection.assignedRole;
      await this.battleStateRepository.deleteActiveConnection(
        currentGameState.gameId,
        input.participantId,
      );
    }

    return this.updateConnectionCount(currentGameState, assignedRole, -1);
  }

  async handleDisconnectUser(userId: string) {
    await this.battleStateRepository.handleDisconnectUser(userId);
  }

  async validateInput(input: BattleInputValidationInput): Promise<BattleInputValidationResult> {
    if (input.assignedRole !== "player") {
      return this.rejectInput("NOT_PLAYER", "플레이어만 입력할 수 있습니다.");
    }

    const currentGameState = await this.getCurrentGameState();

    if (!currentGameState) {
      return this.rejectInput("GAME_NOT_FOUND", "진행 중인 게임이 없습니다.");
    }

    if (currentGameState.gameId !== input.gameId) {
      return this.rejectInput("GAME_MISMATCH", "현재 게임과 입력 게임이 일치하지 않습니다.");
    }

    if (currentGameState.phase !== "in_progress") {
      return this.rejectInput("GAME_NOT_IN_PROGRESS", "게임 진행 중에만 입력할 수 있습니다.");
    }

    const previousParticipantState = await this.battleStateRepository.getParticipantState(
      currentGameState.gameId,
      input.participantId,
    );
    const participantState =
      previousParticipantState ??
      this.createParticipantState({
        assignedRole: input.assignedRole,
        currentGameState,
        participantId: input.participantId,
        socketId: input.socketId,
      });

    if (participantState.status === "eliminated") {
      return this.rejectInput("PLAYER_ELIMINATED", "탈락한 플레이어는 입력할 수 없습니다.");
    }

    if (participantState.status === "finished") {
      return this.buildAcceptedInputResult({
        currentGameState,
        isTypo: false,
        participantState,
        typedLength: this.getTextLength(input.typedText),
        typoIndex: null,
      });
    }

    const comparison = this.compareTypedText(currentGameState.prompt.content, input.typedText);
    const nextParticipantState = this.applyInputResult({
      comparison,
      currentGameState,
      participantState,
      socketId: input.socketId,
    });

    await this.battleStateRepository.saveParticipantState(nextParticipantState);
    await this.battleStateRepository.updateScoreboard(nextParticipantState);

    return this.buildAcceptedInputResult({
      currentGameState,
      isTypo: comparison.typoIndex !== null,
      participantState: nextParticipantState,
      typedLength: comparison.typedLength,
      typoIndex: comparison.typoIndex,
    });
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
      finishReason: null,
      phase: "in_progress" as const,
      gameStartedAt: startedAt,
      gameEndedAt: null,
      hasTenSecondNoticeSent: false,
      nextWaitingStartsAt: null,
      rankings: [],
      updatedAt: startedAt,
      waitingEndsAt: null,
      waitingStartedAt: null,
      winnerParticipantId: null,
    };

    await this.battleStateRepository.saveCurrentGameState(startedGameState);
    await this.battleStateRepository.resetPlayerStatus(currentGameState.gameId);

    return startedGameState;
  }

  async restartWaitingCountdown(currentGameState: CurrentGameState) {
    const now = new Date();
    const waitingStartedAt = now.toISOString();
    const waitingEndsAt = new Date(now.getTime() + WAITING_DURATION_SECONDS * 1000).toISOString();
    const restartedWaitingGameState = {
      ...currentGameState,
      finishReason: null,
      gameEndedAt: null,
      hasTenSecondNoticeSent: false,
      nextWaitingStartsAt: null,
      rankings: [],
      updatedAt: waitingStartedAt,
      waitingEndsAt,
      waitingStartedAt,
      winnerParticipantId: null,
    };

    await this.battleStateRepository.saveCurrentGameState(restartedWaitingGameState);
    await this.battleStateRepository.resetPlayerStatus(currentGameState.gameId);

    return restartedWaitingGameState;
  }

  async finishCurrentGame(reason?: BattleFinishReason): Promise<BattleFinishedResult | null> {
    const currentGameState = await this.getCurrentGameState();

    if (!currentGameState || currentGameState.phase !== "in_progress") {
      return null;
    }

    const hasLock = await this.battleStateRepository.acquireGameFinishLock(
      currentGameState.gameId,
      createUuidV7(),
      FINISH_LOCK_TTL_SECONDS,
    );

    if (!hasLock) {
      return null;
    }

    const lockedGameState = await this.getCurrentGameState();

    if (
      !lockedGameState ||
      lockedGameState.gameId !== currentGameState.gameId ||
      lockedGameState.phase !== "in_progress"
    ) {
      return null;
    }

    const participants = await this.battleStateRepository.getPlayerParticipantStates(
      lockedGameState.gameId,
    );
    const finishReason = this.resolveFinishReason(lockedGameState, participants) ?? reason;

    if (!finishReason) {
      return null;
    }

    const finishedAt = new Date().toISOString();
    const result = this.buildGameResult({
      finishedAt,
      participants,
      reason: finishReason,
      gameId: lockedGameState.gameId,
    });
    const finishedGameState = {
      ...lockedGameState,
      finishReason,
      phase: "finished" as const,
      gameEndedAt: finishedAt,
      nextWaitingStartsAt: new Date(
        new Date(finishedAt).getTime() + FINISHED_DURATION_SECONDS * 1000,
      ).toISOString(),
      rankings: result.rankings,
      updatedAt: finishedAt,
      winnerParticipantId: result.winnerParticipantId,
    };

    await this.battleStateRepository.saveCurrentGameState(finishedGameState);
    await this.battleStateRepository.saveGameResult(result);
    await this.recordBattleResult(lockedGameState, result);
    await this.recordUserStats(result);

    const allParticipantsIds = participants.map((p) => p.participantId);

    await Promise.all(
      allParticipantsIds.map(async (id) => this.battleStateRepository.removeLobbyEntry(id)),
    );

    return {
      finishedGameState,
      result,
    };
  }

  async finishCurrentGameIfNeeded(
    currentGameState?: CurrentGameState,
  ): Promise<BattleFinishedResult | null> {
    const gameState = currentGameState ?? (await this.getCurrentGameState());

    if (!gameState || gameState.phase !== "in_progress") {
      return null;
    }

    const participants = await this.battleStateRepository.getPlayerParticipantStates(
      gameState.gameId,
    );
    const reason = this.resolveFinishReason(gameState, participants);

    if (!reason) {
      return null;
    }

    return this.finishCurrentGame(reason);
  }

  async startNextWaitingGameIfReady(currentGameState?: CurrentGameState) {
    const gameState = currentGameState ?? (await this.getCurrentGameState());

    if (!gameState || gameState.phase !== "finished") {
      return null;
    }

    if (
      gameState.nextWaitingStartsAt &&
      new Date(gameState.nextWaitingStartsAt).getTime() > Date.now()
    ) {
      return null;
    }

    const waitingGameState = await this.createWaitingGameState(new Date());

    await this.battleStateRepository.saveCurrentGameState(waitingGameState);

    return waitingGameState;
  }

  private async createWaitingGameState(now: Date) {
    const gameId = createUuidV7();
    const prompt = await this.promptRepository.getRandomPrompt();
    const waitingStartedAt = now.toISOString();
    const waitingEndsAt = new Date(now.getTime() + WAITING_DURATION_SECONDS * 1000).toISOString();

    const gameState = {
      createdAt: waitingStartedAt,
      finishReason: null,
      gameEndedAt: null,
      gameStartedAt: null,
      gameId,
      hasTenSecondNoticeSent: false,
      nextWaitingStartsAt: null,
      phase: "waiting" as const,
      playerCount: 0,
      minPlayers: 4, // default = 4
      prompt,
      rankings: [],
      spectatorCount: 0,
      updatedAt: waitingStartedAt,
      waitingEndsAt,
      waitingStartedAt,
      winnerParticipantId: null,
    };

    return gameState;
  }

  private applyInputResult(input: {
    comparison: {
      acceptedLength: number;
      expectedLength: number;
      isComplete: boolean;
      typedLength: number;
      typoIndex: null | number;
    };
    currentGameState: CurrentGameState;
    participantState: BattleParticipantState;
    socketId: string;
  }) {
    const now = new Date().toISOString();
    const shouldApplyPenalty =
      input.comparison.typoIndex !== null &&
      input.comparison.typoIndex !== input.participantState.lastPenaltyIndex;
    const life = shouldApplyPenalty
      ? Math.max(0, input.participantState.life - 1)
      : input.participantState.life;
    const status = life === 0 ? "eliminated" : input.comparison.isComplete ? "finished" : "playing";
    const eliminatedAt =
      status === "eliminated" && input.participantState.status !== "eliminated"
        ? now
        : (input.participantState.eliminatedAt ?? null);
    const finishedAt =
      status === "finished" && input.participantState.status !== "finished"
        ? now
        : (input.participantState.finishedAt ?? null);

    return {
      ...input.participantState,
      acceptedLength: Math.max(
        input.participantState.acceptedLength,
        input.comparison.acceptedLength,
      ),
      accuracy: this.calculateAccuracy(
        Math.max(input.participantState.acceptedLength, input.comparison.acceptedLength),
        input.comparison.typedLength,
      ),
      eliminatedAt,
      finishedAt,
      lastInputAt: now,
      lastPenaltyIndex:
        input.comparison.typoIndex === null
          ? input.participantState.lastPenaltyIndex
          : input.comparison.typoIndex,
      life,
      wpm: this.calculateWpm(input.comparison.acceptedLength, input.currentGameState.gameStartedAt),
      progressPercent: this.calculateProgressPercent(
        input.comparison.acceptedLength,
        input.comparison.expectedLength,
      ),
      socketId: input.socketId,
      status,
      typoCount: shouldApplyPenalty
        ? input.participantState.typoCount + 1
        : input.participantState.typoCount,
    } satisfies BattleParticipantState;
  }

  private buildAcceptedInputResult(input: {
    currentGameState: CurrentGameState;
    isTypo: boolean;
    participantState: BattleParticipantState;
    typedLength: number;
    typoIndex: null | number;
  }): BattleInputAcceptedResult {
    return {
      data: {
        acceptedLength: input.participantState.acceptedLength,
        accuracy: input.participantState.accuracy,
        expectedLength: this.getTextLength(input.currentGameState.prompt.content),
        gameId: input.currentGameState.gameId,
        isEliminated: input.participantState.status === "eliminated",
        isFinished: input.participantState.status === "finished",
        isTypo: input.isTypo,
        life: input.participantState.life,
        participant: input.participantState,
        progressPercent: input.participantState.progressPercent,
        typedLength: input.typedLength,
        typoIndex: input.typoIndex,
      },
      ok: true,
    };
  }

  private buildGameResult(input: {
    finishedAt: string;
    gameId: string;
    participants: BattleParticipantState[];
    reason: BattleFinishReason;
  }): BattleGameResult {
    const rankings = this.rankParticipants(input.participants, input.reason);
    const winner = rankings.find((ranking) => ranking.isWinner) ?? null;

    return {
      finishedAt: input.finishedAt,
      gameId: input.gameId,
      rankings,
      reason: input.reason,
      winnerParticipantId: winner?.participantId ?? null,
    };
  }

  private async recordUserStats(result: BattleGameResult) {
    try {
      await this.usersService.recordBattleResults(
        result.rankings.map((ranking) => ({
          acceptedLength: ranking.acceptedLength,
          isWinner: ranking.isWinner,
          rank: ranking.rank,
          userId: ranking.participantId,
          wpm: ranking.wpm,
        })),
      );
    } catch (error) {
      this.logger.error(
        `Failed to persist user battle stats for game ${result.gameId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async recordBattleResult(currentGameState: CurrentGameState, result: BattleGameResult) {
    try {
      await this.battleResultRepository.saveBattleGameResult({
        currentGameState,
        result,
      });
    } catch (error) {
      this.logger.error(
        `Failed to persist battle game result for game ${result.gameId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private resolveFinishReason(
    currentGameState: CurrentGameState,
    participants: BattleParticipantState[],
  ): BattleFinishReason | null {
    if (
      participants.some(
        (participant) => participant.status === "finished" || participant.progressPercent >= 100,
      )
    ) {
      return "completed";
    }

    if (
      participants.length > 0 &&
      participants.every((participant) => participant.status === "eliminated")
    ) {
      return "all_eliminated";
    }

    if (this.isGameTimeExpired(currentGameState)) {
      return "time_limit";
    }

    return null;
  }

  private rankParticipants(
    participants: BattleParticipantState[],
    reason: BattleFinishReason,
  ): BattleRankingEntry[] {
    const orderedParticipants =
      reason === "completed"
        ? this.rankCompletedGameParticipants(participants)
        : reason === "all_eliminated"
          ? [...participants].sort((left, right) => this.compareByEliminatedAtDesc(left, right))
          : [...participants].sort((left, right) => this.compareByProgressDesc(left, right));

    return orderedParticipants.map((participant, index) =>
      this.toRankingEntry(participant, index + 1, index === 0),
    );
  }

  private rankCompletedGameParticipants(participants: BattleParticipantState[]) {
    const completedParticipants = participants
      .filter(
        (participant) => participant.status === "finished" || participant.progressPercent >= 100,
      )
      .sort((left, right) => this.compareByFinishedAtAsc(left, right));
    const winner = completedParticipants[0];

    if (!winner) {
      return [...participants].sort((left, right) => this.compareByProgressDesc(left, right));
    }

    const rest = participants
      .filter((participant) => participant.participantId !== winner.participantId)
      .sort((left, right) => this.compareByProgressDesc(left, right));

    return [winner, ...rest];
  }

  private toRankingEntry(
    participant: BattleParticipantState,
    rank: number,
    isWinner: boolean,
  ): BattleRankingEntry {
    return {
      acceptedLength: participant.acceptedLength,
      accuracy: participant.accuracy,
      eliminatedAt: participant.eliminatedAt ?? null,
      finalStatus: this.getFinalStatus(participant, isWinner),
      finishedAt: participant.finishedAt ?? null,
      isWinner,
      life: participant.life,
      participantId: participant.participantId,
      progressPercent: participant.progressPercent,
      rank,
      status: participant.status,
      wpm: participant.wpm,
    };
  }

  private getFinalStatus(participant: BattleParticipantState, isWinner: boolean) {
    if (isWinner) {
      return "winner";
    }

    if (participant.status === "finished") {
      return "finished";
    }

    if (participant.status === "eliminated") {
      return "eliminated";
    }

    return "playing";
  }

  private compareByFinishedAtAsc(left: BattleParticipantState, right: BattleParticipantState) {
    return (
      this.getTimestamp(left.finishedAt, Number.MAX_SAFE_INTEGER) -
        this.getTimestamp(right.finishedAt, Number.MAX_SAFE_INTEGER) ||
      this.compareByProgressDesc(left, right)
    );
  }

  private compareByEliminatedAtDesc(left: BattleParticipantState, right: BattleParticipantState) {
    return (
      this.getTimestamp(right.eliminatedAt ?? right.lastInputAt, 0) -
        this.getTimestamp(left.eliminatedAt ?? left.lastInputAt, 0) ||
      this.compareByProgressDesc(left, right)
    );
  }

  private compareByProgressDesc(left: BattleParticipantState, right: BattleParticipantState) {
    return (
      right.progressPercent - left.progressPercent ||
      right.acceptedLength - left.acceptedLength ||
      right.life - left.life ||
      right.accuracy - left.accuracy ||
      right.wpm - left.wpm ||
      this.getTimestamp(left.lastInputAt, Number.MAX_SAFE_INTEGER) -
        this.getTimestamp(right.lastInputAt, Number.MAX_SAFE_INTEGER) ||
      left.participantId.localeCompare(right.participantId)
    );
  }

  private getTimestamp(value: null | string | undefined, fallback: number) {
    if (!value) {
      return fallback;
    }

    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp) ? fallback : timestamp;
  }

  private isGameTimeExpired(currentGameState: CurrentGameState) {
    if (!currentGameState.gameStartedAt) {
      return false;
    }

    return (
      Date.now() - new Date(currentGameState.gameStartedAt).getTime() >=
      GAME_DURATION_SECONDS * 1000
    );
  }

  private calculateAccuracy(acceptedLength: number, typedLength: number) {
    if (typedLength === 0) {
      return 100;
    }

    return Math.round((acceptedLength / typedLength) * 1000) / 10;
  }

  private calculateProgressPercent(acceptedLength: number, expectedLength: number) {
    if (expectedLength === 0) {
      return 100;
    }

    return Math.round((acceptedLength / expectedLength) * 10000) / 100;
  }

  private compareTypedText(expectedText: string, typedText: string) {
    const expectedCharacters = this.toCharacters(expectedText);
    const typedCharacters = this.toCharacters(typedText);
    const comparisonLength = Math.min(expectedCharacters.length, typedCharacters.length);

    for (let index = 0; index < comparisonLength; index += 1) {
      if (expectedCharacters[index] !== typedCharacters[index]) {
        return {
          acceptedLength: index,
          expectedLength: expectedCharacters.length,
          isComplete: false,
          typedLength: typedCharacters.length,
          typoIndex: index,
        };
      }
    }

    if (typedCharacters.length > expectedCharacters.length) {
      return {
        acceptedLength: expectedCharacters.length,
        expectedLength: expectedCharacters.length,
        isComplete: false,
        typedLength: typedCharacters.length,
        typoIndex: expectedCharacters.length,
      };
    }

    return {
      acceptedLength: typedCharacters.length,
      expectedLength: expectedCharacters.length,
      isComplete: typedCharacters.length === expectedCharacters.length,
      typedLength: typedCharacters.length,
      typoIndex: null,
    };
  }

  private createParticipantState(input: {
    assignedRole: ConnectionRole;
    currentGameState: CurrentGameState;
    participantId: string;
    socketId: string;
  }): BattleParticipantState {
    return {
      acceptedLength: 0,
      accuracy: 100,
      eliminatedAt: null,
      finishedAt: null,
      gameId: input.currentGameState.gameId,
      lastInputAt: null,
      lastPenaltyIndex: null,
      life: DEFAULT_PLAYER_LIFE,
      participantId: input.participantId,
      wpm: 0,
      progressPercent: 0,
      role: input.assignedRole,
      socketId: input.socketId,
      status: input.assignedRole === "player" ? "playing" : "spectating",
      typoCount: 0,
    };
  }

  private calculateWpm(acceptedLength: number, gameStartedAt: null | string) {
    if (!gameStartedAt || acceptedLength === 0) {
      return 0;
    }

    const elapsedMinutes = (Date.now() - new Date(gameStartedAt).getTime()) / 1000 / 60;

    if (elapsedMinutes <= 0) {
      return 0;
    }

    return Math.round((acceptedLength / 2.5 / elapsedMinutes) * 10) / 10;
  }

  private getTextLength(value: string) {
    return this.toCharacters(value).length;
  }

  private rejectInput(code: string, message: string): BattleInputRejectedResult {
    return {
      code,
      message,
      ok: false,
    };
  }

  private toCharacters(value: string) {
    return Array.from(value.normalize("NFC"));
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
