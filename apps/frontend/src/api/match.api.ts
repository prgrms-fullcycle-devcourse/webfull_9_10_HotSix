import { api } from "@/lib/api";
import type { MatchUser } from "@/types/game/user";

type JoinMatchResponse = {
  socketAuthToken: string;
};

export const joinMatch = async () => {
  const { data } = await api.post<JoinMatchResponse>("/v1/match/join");

  return data;
};

// 대기자 목록
export const getUsers = async () => {
  const data = await api.get<MatchUser>("/v1/match/users");
  // console.log("API raw:", data.data);
  return data.data;
};
