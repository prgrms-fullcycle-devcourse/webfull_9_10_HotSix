import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { SOCKET_EVENTS } from "../../../common/constants/socket-events";
import { createUuidV7 } from "../../../common/uuid";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleStateRepository } from "../repositories/battle-state.repository";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleService } from "./battle.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleBroadcastService } from "./battle-broadcast.service";

const TIMER_INTERVAL_MILLISECONDS = 1000;
const TIMER_LOCK_TTL_SECONDS = 1;

@Injectable()
export class BattleCycleService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(BattleCycleService.name);

  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly battleBroadcastService: BattleBroadcastService,
    private readonly battleService: BattleService,
    private readonly battleStateRepository: BattleStateRepository,
  ) {}

  async onModuleInit() {
    await this.battleService.ensureCurrentGameState();
    this.startTimer();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async finishCurrentGame() {
    const finishedResult = await this.battleService.finishCurrentGame();

    if (!finishedResult) {
      return null;
    }

    this.logger.log(`Finished game ${finishedResult.finishedGameState.gameId}`);
    this.battleBroadcastService.emitToAll(
      SOCKET_EVENTS.BATTLE_FINISHED,
      this.battleService.buildStatePayload(finishedResult.finishedGameState),
    );
    this.battleBroadcastService.emitToAll(
      SOCKET_EVENTS.BATTLE_WAITING,
      this.battleService.buildWaitingPayload(finishedResult.nextWaitingGameState),
    );

    return finishedResult;
  }

  private async handleTimerTick() {
    const hasLock = await this.battleStateRepository.acquireTimerLock(
      createUuidV7(),
      TIMER_LOCK_TTL_SECONDS,
    );

    if (!hasLock) {
      return;
    }

    const currentGameState = await this.battleService.ensureCurrentGameState();

    if (currentGameState.phase !== "waiting") {
      return;
    }

    const remainingSeconds = this.battleService.getWaitingRemainingSeconds(currentGameState);

    if (remainingSeconds === 0) {
      if (!this.battleService.canStartCurrentGame(currentGameState)) {
        const restartedWaitingGameState =
          await this.battleService.restartWaitingCountdown(currentGameState);

        this.logger.log(
          `Restarted waiting timer for game ${restartedWaitingGameState.gameId} because only ${restartedWaitingGameState.playerCount} of ${restartedWaitingGameState.minPlayers} players are connected`,
        );
        this.battleBroadcastService.emitToAll(
          SOCKET_EVENTS.BATTLE_WAITING,
          this.battleService.buildWaitingPayload(restartedWaitingGameState),
        );
        this.battleBroadcastService.emitToAll(
          SOCKET_EVENTS.BATTLE_STATE,
          this.battleService.buildStatePayload(restartedWaitingGameState),
        );

        return;
      }

      const startedGameState = await this.battleService.startCurrentGame(currentGameState);

      this.logger.log(`Started game ${startedGameState.gameId}`);
      this.battleBroadcastService.emitToAll(
        SOCKET_EVENTS.BATTLE_STARTED,
        this.battleService.buildStatePayload(startedGameState),
      );
      this.battleBroadcastService.emitToAll(
        SOCKET_EVENTS.BATTLE_STATE,
        this.battleService.buildStatePayload(startedGameState),
      );

      return;
    }

    this.battleBroadcastService.emitToAll(
      SOCKET_EVENTS.BATTLE_WAITING,
      this.battleService.buildWaitingPayload(currentGameState),
    );
  }

  private startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      void this.handleTimerTick();
    }, TIMER_INTERVAL_MILLISECONDS);
  }
}
