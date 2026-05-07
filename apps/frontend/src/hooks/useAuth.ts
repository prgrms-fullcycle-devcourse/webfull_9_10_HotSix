import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser, userDashboard, userInfo } from "@/api/auth.api";
import { PATH } from "@/constants/route";
import { useAuthStore } from "@/stores/useAuthStore";

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const { user, tokens } = data.data;

      setAuth({
        user,
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      });
      navigate(PATH.GAME_LOBBY);
    },
  });
};

export const useUserInfo = () => {
  return useQuery({
    queryKey: ["user-info"],
    queryFn: userInfo,
  });
};

export const useUserDashboard = () => {
  return useQuery({
    queryKey: ["user-info", "user-dashboard"],
    queryFn: userDashboard,
  });
};
