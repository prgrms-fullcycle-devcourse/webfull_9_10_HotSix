export type BattleReadyPayload = {
  nickname: string;
};

export type BattleReadyConfirmed = {
  nickname: string;
  status: "queued";
};
