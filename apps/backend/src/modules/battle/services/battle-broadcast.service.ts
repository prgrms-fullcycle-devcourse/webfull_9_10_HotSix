import { Injectable } from "@nestjs/common";
import type { Server } from "socket.io";

@Injectable()
export class BattleBroadcastService {
  private server: null | Server = null;

  emitToAll(event: string, payload: unknown) {
    this.server?.emit(event, payload);
  }

  setServer(server: Server) {
    this.server = server;
  }
}
