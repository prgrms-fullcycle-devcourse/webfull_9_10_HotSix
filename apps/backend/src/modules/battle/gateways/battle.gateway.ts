import { type OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
// biome-ignore lint/style/useImportType: Nest DI needs a runtime class reference.
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
    let currentGameState = await this.battleService.getCurrentGameState();
    if (!currentGameState) {
      currentGameState = await this.battleService.startNewGame();
    }
    if (currentGameState?.phase === "waiting") {
      client.emit("battle:join", currentGameState);
    } else if (currentGameState?.phase === "in_progress") {
      client.emit("battle:spectate", currentGameState);
    }
  }
}
