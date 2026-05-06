import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../../common/constants/socket-events";
import type { BattleReadyDto } from "../dto/battle-ready.dto";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleService } from "../services/battle.service";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import { BattleBroadcastService } from "../services/battle-broadcast.service";

@WebSocketGateway({
  namespace: "/battle",
  cors: {
    origin: "*",
  },
})
export class BattleGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private readonly battleService: BattleService,
    private readonly battleBroadcastService: BattleBroadcastService,
  ) {}

  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    this.battleBroadcastService.setServer(server);
  }

  async handleConnection(client: Socket) {
    const connection = await this.battleService.registerConnection();
    const roomName = this.getBattleRoomName(connection.state.gameId);

    client.data.assignedRole = connection.assignedRole;
    client.data.gameId = connection.state.gameId;

    client.join(roomName);
    client.emit(SOCKET_EVENTS.BATTLE_WELCOME, this.battleService.getWelcomeMessage());
    client.emit(SOCKET_EVENTS.BATTLE_STATE, connection.state);

    if (connection.waiting) {
      client.emit(SOCKET_EVENTS.BATTLE_WAITING, connection.waiting);
      client.broadcast.to(roomName).emit(SOCKET_EVENTS.BATTLE_WAITING, connection.waiting);
    } else {
      client.broadcast.to(roomName).emit(SOCKET_EVENTS.BATTLE_STATE, connection.state);
    }
  }

  async handleDisconnect(client: Socket) {
    const assignedRole = this.getAssignedRole(client);
    const gameId = this.getGameId(client);
    const updatedGameState = await this.battleService.unregisterConnection({
      assignedRole,
      gameId,
    });

    if (!updatedGameState) {
      return;
    }

    const roomName = this.getBattleRoomName(updatedGameState.gameId);

    if (assignedRole === "player" && updatedGameState.phase === "in_progress") {
      this.server.to(roomName).emit(SOCKET_EVENTS.BATTLE_ELIMINATED, {
        gameId: updatedGameState.gameId,
        reason: "disconnected",
        socketId: client.id,
        ...this.getUserIdPayload(client),
      });
    }

    if (updatedGameState.phase === "waiting") {
      this.server
        .to(roomName)
        .emit(
          SOCKET_EVENTS.BATTLE_WAITING,
          this.battleService.buildWaitingPayload(updatedGameState),
        );
      return;
    }

    this.server
      .to(roomName)
      .emit(SOCKET_EVENTS.BATTLE_STATE, this.battleService.buildStatePayload(updatedGameState));
  }

  @SubscribeMessage(SOCKET_EVENTS.BATTLE_READY)
  handleReady(@MessageBody() payload: BattleReadyDto, @ConnectedSocket() client: Socket) {
    const confirmed = this.battleService.createReadyConfirmation(payload);
    const gameId = this.getGameId(client);

    if (gameId) {
      client.broadcast
        .to(this.getBattleRoomName(gameId))
        .emit(SOCKET_EVENTS.BATTLE_PLAYER_READY, payload);
    } else {
      client.broadcast.emit(SOCKET_EVENTS.BATTLE_PLAYER_READY, payload);
    }

    return {
      event: SOCKET_EVENTS.BATTLE_READY_CONFIRMED,
      data: confirmed,
    };
  }

  private getAssignedRole(client: Socket) {
    const assignedRole = client.data.assignedRole;

    return assignedRole === "player" || assignedRole === "spectator" ? assignedRole : undefined;
  }

  private getBattleRoomName(gameId: string) {
    return `battle:${gameId}`;
  }

  private getGameId(client: Socket) {
    return typeof client.data.gameId === "string" ? client.data.gameId : undefined;
  }

  private getUserIdPayload(client: Socket) {
    return typeof client.data.userId === "string" ? { userId: client.data.userId } : {};
  }
}
