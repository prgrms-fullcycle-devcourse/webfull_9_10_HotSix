import { useEffect, useState } from "react";
import { refreshUser } from "@/api/auth.api";
import MainTitle from "@/components/auth/MainTitle";
import PixelButton from "@/components/common/PixelButton";
import { useLogin } from "@/hooks/useAuth";
import { useEnterBattle } from "@/hooks/useEnterBattle";
import { useAuthStore } from "@/stores/useAuthStore";

const LoginPage = () => {
  const { mutateAsync: userLogin, isPending: isLoginPending } = useLogin();
  const setAuth = useAuthStore((state) => state.setAuth);
  const enterBattle = useEnterBattle();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await refreshUser();
        if (!mounted) return;

        const { user, tokens } = res.data;
        setAuth({
          user,
          accessToken: tokens.accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        });
        await enterBattle();
      } catch {
        // refresh 쿠키 없음/만료 → 로그인 버튼으로 게스트 생성 진행
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enterBattle, setAuth]);

  const handleStart = async () => {
    await userLogin();
    await enterBattle();
  };

  if (isBootstrapping) {
    return (
      <main className="font-pixel relative min-h-screen bg-app flex items-center justify-center">
        <span className="text-text">로딩중...</span>
      </main>
    );
  }

  return (
    <main className="font-pixel relative min-h-screen bg-app flex flex-col">
      <MainTitle />

      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <PixelButton type="button" onClick={handleStart} disabled={isLoginPending}>
          시작하기
        </PixelButton>
      </div>
    </main>
  );
};

export default LoginPage;
