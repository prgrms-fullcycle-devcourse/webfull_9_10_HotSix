import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/api/auth.api";
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
