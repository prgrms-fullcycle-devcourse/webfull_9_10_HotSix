export const BATTLE_SOCKET_AUTH_TOKEN_TTL_SECONDS = 60 * 60;

export function getBattleActiveConnectionKey(gameId: string, participantId: string) {
  return `battle:game:${gameId}:active-connection:${participantId}`;
}

export function getBattleSocketAuthTokenKey(token: string) {
  return `battle:socket-auth-token:${token}`;
}
