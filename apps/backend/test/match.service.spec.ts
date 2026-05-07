jest.mock("node:crypto", () => ({
  randomUUID: jest.fn(() => "socket-token-id"),
}));

import {
  BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS,
  getBattleSocketAuthTokenKey,
} from "../src/modules/battle/constants/battle-redis-keys";
import { MatchService } from "../src/modules/match/match.service";
import type { RedisService } from "../src/modules/storage/redis/redis.service";
import type { UsersRepository } from "../src/modules/users/users.repository";

describe("MatchService", () => {
  it("stores a short-lived socket auth token when a user joins the game", async () => {
    const hget = jest.fn().mockResolvedValue("waiting");
    const hset = jest.fn();
    const sadd = jest.fn();
    const set = jest.fn();
    const usersRepository = {
      findById: jest.fn().mockResolvedValue({
        avatarUrl: "https://example.com/avatar.png",
        nickname: "Jay",
      }),
    } as unknown as UsersRepository;
    const redisService = {
      instance: {
        hget,
        hset,
        sadd,
        set,
      },
    } as unknown as RedisService;
    const service = new MatchService(redisService, usersRepository);

    const result = await service.joinGame("user-1");

    expect(result).toMatchObject({
      role: "player",
      socketAuthToken: "ws_tk_socket-token-id",
      socketNamespace: "/battle",
      status: "waiting",
      userId: "user-1",
    });
    expect(set).toHaveBeenCalledWith(
      getBattleSocketAuthTokenKey("ws_tk_socket-token-id"),
      expect.stringContaining('"userId":"user-1"'),
      "EX",
      BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS,
    );
  });
});
