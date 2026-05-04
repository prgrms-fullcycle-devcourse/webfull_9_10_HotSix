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
  cors: {
    origin: "*",
  },
})
export class BattleGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private readonly battleBroadcastService: BattleBroadcastService,
    private readonly battleService: BattleService,
  ) {}

  @WebSocketServer()
  server!: Server;

  afterInit(server: Server) {
    this.battleBroadcastService.setServer(server);
  }

  async handleConnection(client: Socket) {
    const connectionState = await this.battleService.registerConnection();

    client.data.assignedRole = connectionState.assignedRole;
    client.emit(SOCKET_EVENTS.BATTLE_WELCOME, {
      ...this.battleService.getWelcomeMessage(),
      assignedRole: connectionState.assignedRole,
    });
    client.emit(
      connectionState.assignedRole === "player"
        ? SOCKET_EVENTS.BATTLE_JOIN
        : SOCKET_EVENTS.BATTLE_SPECTATE,
      connectionState,
    );
    client.emit(SOCKET_EVENTS.BATTLE_STATE, connectionState.state);

    if (connectionState.waiting) {
      client.emit(SOCKET_EVENTS.BATTLE_WAITING, connectionState.waiting);
    }
  }

  async handleDisconnect(client: Socket) {
    await this.battleService.unregisterConnection(client.data.assignedRole);
  }

  @SubscribeMessage(SOCKET_EVENTS.BATTLE_READY)
  handleReady(@MessageBody() payload: BattleReadyDto, @ConnectedSocket() client: Socket) {
    const confirmed = this.battleService.createReadyConfirmation(payload);

    client.emit(SOCKET_EVENTS.BATTLE_READY_CONFIRMED, confirmed);
    client.broadcast.emit(SOCKET_EVENTS.BATTLE_PLAYER_READY, payload);
  }
}
