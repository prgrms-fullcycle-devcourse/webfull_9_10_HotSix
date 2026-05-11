import { api } from "@/lib/api";

type JoinMatchResponse = {
  socketAuthToken: string;
};

export const joinMatch = async () => {
  const { data } = await api.post<JoinMatchResponse>("/v1/match/join");

  return data;
};
