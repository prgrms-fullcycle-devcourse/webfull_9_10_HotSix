export const BATTLE_SOCKET_EVENTS = {
  ERROR: "battle:error",
  WELCOME: "battle:welcome",

  STATE: "battle:state",
  WAITING: "battle:waiting",
  STARTED: "battle:started",
  FINISHED: "battle:finished",

  READY: "battle:ready",
  PLAYER_READY: "battle:player-ready",

  INPUT: "battle:input",
  PROGRESS: "battle:progress",

  ELIMINATED: "battle:eliminated",
} as const;
