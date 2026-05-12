import { api } from "@/lib/api";
import type { GameDetailResponse } from "@/types/game/gameDetail";
import type { ScoreboardItem } from "@/types/game/scoreboard";

// 게임 기본 정보
export const getGameDetail = async () => {
  const data = await api.get<GameDetailResponse>("/v1/games/current");
  return data.data;
};

// 참가자 목록
export const getScoreBoard = async () => {
  const data = await api.get<ScoreboardItem[]>("/v1/games/current/scoreboard");
  return data.data;
};
