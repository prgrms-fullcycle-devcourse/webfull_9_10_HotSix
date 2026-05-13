export const PATH = {
  ROOT: "/",
  GAME_LOBBY: "/lobby",
  GAME: "/game",
  SPECTATE: "/spectate",
  SETTING: "/setting",
} as const;

export type PathValue = (typeof PATH)[keyof typeof PATH];
