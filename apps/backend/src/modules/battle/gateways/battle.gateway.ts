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

  handleConnection(client: Socket) {
    client.emit(SOCKET_EVENTS.BATTLE_WELCOME, this.battleService.getWelcomeMessage());
  }

  @SubscribeMessage(SOCKET_EVENTS.BATTLE_READY)
  handleReady(@MessageBody() payload: BattleReadyDto, @ConnectedSocket() client: Socket) {
    const confirmed = this.battleService.createReadyConfirmation(payload);

    client.broadcast.emit(SOCKET_EVENTS.BATTLE_PLAYER_READY, payload);

    return {
      event: SOCKET_EVENTS.BATTLE_READY_CONFIRMED,
      data: confirmed,
    };
  }
}
