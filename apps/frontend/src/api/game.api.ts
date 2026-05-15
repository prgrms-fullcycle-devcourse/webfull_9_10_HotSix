import { api } from "@/lib/api";
import type { GameDetailResponse } from "@/types/game/gameDetail";
import type { LatestGameResultResponse } from "@/types/game/result";
import type { ScoreboardItem } from "@/types/game/scoreboard";

// 게임 기본 정보
export const getGameDetail = async () => {
  const data = await api.get<GameDetailResponse>("/v1/games/current");
  console.log("API raw:", data.data);
  return data.data;
};

// 참가자 목록 (순위)
export const getScoreBoard = async () => {
  const data = await api.get<ScoreboardItem[]>("/v1/games/current/scoreboard");
  return data.data;
};

// 관전자 목록
export const getSpectators = async () => {
  const data = await api.get<ScoreboardItem[]>("/v1/games/current/spectators");
  return data.data;
};

export const getLatestGameResult = async () => {
  const data = await api.get<LatestGameResultResponse>("/v1/games/current/result");
  return data.data;
};
