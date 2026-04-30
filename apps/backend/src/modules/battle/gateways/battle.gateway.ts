import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../../../common/constants/socket-events";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
import type { BattleReadyDto } from "../dto/battle-ready.dto";
import type { BattleService } from "../services/battle.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class BattleGateway implements OnGatewayConnection {
  constructor(private readonly battleService: BattleService) {}

  @WebSocketServer()
  server!: Server;

  async handleConnection(client: Socket) {
    const connectionState = await this.battleService.getConnectionState();

    client.emit(SOCKET_EVENTS.BATTLE_WELCOME, {
      ...this.battleService.getWelcomeMessage(),
      game: connectionState,
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.BATTLE_READY)
  handleReady(@MessageBody() payload: BattleReadyDto, @ConnectedSocket() client: Socket) {
    const confirmed = this.battleService.createReadyConfirmation(payload);

    client.emit(SOCKET_EVENTS.BATTLE_READY_CONFIRMED, confirmed);
    client.broadcast.emit(SOCKET_EVENTS.BATTLE_PLAYER_READY, payload);
  }
}
