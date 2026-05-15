import mockProfile from "@/assets/icons/char1.svg";
import Header from "@/components/common/Header";
import ShadowBox from "@/components/common/ShadowBox";
import { SquareSizeCheckbox } from "@/components/common/SquareCheckbox";
import StatCard from "@/components/common/StatCard";
import ThemeToggle from "@/components/setting/ThemeToggle";
import { useUserDashboard, useUserInfo } from "@/hooks/useAuth";
import { useThemeStore, useTypingFontSizeClass } from "@/stores/useThemeStore";

type SettingPageProps = {
  onBack: () => void;
};

export default function SettingPage({ onBack }: SettingPageProps) {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const fontSize = useThemeStore((state) => state.typingFontSize);
  const setFontSize = useThemeStore((state) => state.setTypingFontSize);

  const { data: userInfo } = useUserInfo();
  const { data: userDashboard } = useUserDashboard();

  const previewTextSizeClass = useTypingFontSizeClass();

  if (!userInfo || !userDashboard) return <div>로딩중...</div>;

  return (
    <div className="min-h-screen pt-24 px-4">
      <Header onBack={onBack} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        {/* 상단: 프로필 & 통계 영역 */}
        <ShadowBox className="w-full">
          <div className="flex flex-col gap-6 px-8 py-6 text-">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded bg-surface-sub">
                {/* {userInfo?.avatarUrl ? ( */}
                {/* <img alt="user-profile" src={userInfo?.avatarUrl} /> */}
                {/* ) : ( */}
                <img alt="mock-profile" src={mockProfile} />
                {/* )} */}
              </div>
              <div className="text-title-sm">{userInfo?.nickname}</div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="평균타수" value={`${userDashboard.data.averageWpm ?? 0} 타`} />
              <StatCard label="정확도" value={`${userDashboard.data.averageAccuracy ?? 0} %`} />
              <StatCard label="승리 횟수" value={`${userDashboard.data.wins ?? 0} 회`} />
            </div>
          </div>
        </ShadowBox>

        {/* 하단: 설정 영역 */}
        <ShadowBox className="w-full">
          <div className="flex flex-col gap-8 px-8 py-6">
            {/* 화면 모드 */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-body">화면 모드</span>
              </div>
              <div className="flex flex-1 items-center">
                <div className="h-px flex-1 border-t border-dotted border-text opacity-60" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">라이트</span>
                <ThemeToggle mode={theme} onChange={setTheme} />
                <span className="text-sm">다크</span>
              </div>
            </div>

            {/* 글자 크기 */}
            <div className="flex flex-col gap-4">
              <span className="text-body">글자 크기</span>
              <div className="flex flex-wrap items-center gap-6">
                <SquareSizeCheckbox
                  label="작게"
                  checked={fontSize === "small"}
                  onClick={() => setFontSize("small")}
                />
                <SquareSizeCheckbox
                  label="중간"
                  checked={fontSize === "medium"}
                  onClick={() => setFontSize("medium")}
                />
                <SquareSizeCheckbox
                  label="크게"
                  checked={fontSize === "large"}
                  onClick={() => setFontSize("large")}
                />
              </div>

              <div className="mt-4">
                <ShadowBox className="w-full bg-surface-sub">
                  <p className={`text-state-active ${previewTextSizeClass}`}>
                    타이핑 할 공간의 글자 크기 테스트입니다.
                  </p>
                </ShadowBox>
              </div>
            </div>
          </div>
        </ShadowBox>
      </div>
    </div>
  );
}
