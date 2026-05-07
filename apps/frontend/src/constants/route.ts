export const PATH = {
  ROOT: "/",
  GAME_LOBBY: "/lobby",
  GAME: "/game",
  WATCH_ROOM: "/watch",
  SETTING: "/setting",
} as const;

export type PathValue = (typeof PATH)[keyof typeof PATH];
