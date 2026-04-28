export const PATH = {
  ROOT: "/",
  GAME_LOBBY: "/lobby",
  GAME: "/game",
} as const;

export type PathValue = (typeof PATH)[keyof typeof PATH];
