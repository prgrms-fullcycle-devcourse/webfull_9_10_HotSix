import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { refreshUser } from "@/api/auth.api";
import MainTitle from "@/components/auth/MainTitle";
import PixelButton from "@/components/common/PixelButton";
import { useLogin } from "@/hooks/useAuth";
import { useEnterBattle } from "@/hooks/useEnterBattle";
import { useAuthStore } from "@/stores/useAuthStore";

const LoginPage = () => {
  const { mutateAsync: userLogin, isPending: isLoginPending } = useLogin();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const enterBattle = useEnterBattle();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isEnteringBattle, setIsEnteringBattle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        try {
          await enterBattle();
        } catch (error) {
          if (!mounted) return;
          setErrorMessage(getStartErrorMessage(error));
        }
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
    setErrorMessage(null);
    setIsEnteringBattle(true);

    try {
      if (!user) {
        await userLogin();
      }
      await enterBattle();
    } catch (error) {
      setErrorMessage(getStartErrorMessage(error));
    } finally {
      setIsEnteringBattle(false);
    }
  };

  const isStarting = isLoginPending || isEnteringBattle;

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
        <PixelButton type="button" onClick={handleStart} disabled={isStarting}>
          {isStarting ? "접속 중..." : "시작하기"}
        </PixelButton>

        {errorMessage && (
          <p className="max-w-[360px] text-center text-sm font-bold text-point-red">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
};

export default LoginPage;

const getStartErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해 주세요.";
    }

    const message = (error.response.data as { message?: unknown } | undefined)?.message;
    return typeof message === "string" ? message : "게임 접속에 실패했습니다.";
  }

  return "게임 접속에 실패했습니다.";
};
