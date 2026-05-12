export const PATH = {
  ROOT: "/",
  GAME_LOBBY: "/lobby",
  GAME: "/game",
  SPECTATE: "/spectate",
  SETTING: "/setting",
  ENTRY: "/entry",
} as const;

export type PathValue = (typeof PATH)[keyof typeof PATH];
