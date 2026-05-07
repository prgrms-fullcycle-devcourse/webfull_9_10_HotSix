export const PATH = {
  ROOT: "/",
  GAME_LOBBY: "/lobby",
  GAME: "/game",
  WATCH_ROOM: "/watch",
} as const;

export type PathValue = (typeof PATH)[keyof typeof PATH];
