import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { refreshUser } from "@/api/auth.api";
import MainTitle from "@/components/auth/MainTitle";
import PixelButton from "@/components/common/PixelButton";
import { PATH } from "@/constants/route";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/useAuthStore";

const LoginPage = () => {
  const { mutateAsync: userLogin, isPending: isLoginPending } = useLogin();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleStart = async () => {
    try {
      setIsRefreshing(true);
      const res = await refreshUser();
      const { user, tokens } = res.data;

      setAuth({
        user,
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      });
      navigate(PATH.ENTRY);
      return;
    } catch {
      await userLogin();
    } finally {
      setIsRefreshing(false);
    }
  };

  const isPending = isRefreshing || isLoginPending;

  return (
    <main className="font-pixel relative min-h-screen bg-app flex flex-col">
      <MainTitle />

      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <PixelButton type="button" onClick={handleStart} disabled={isPending}>
          시작하기
        </PixelButton>
      </div>
    </main>
  );
};

export default LoginPage;
