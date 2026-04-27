import { useBattleStore } from "@/stores/useBattleStore";

const cards = ["실시간 매치 입장", "키 입력 점수 집계", "생존자 랭킹 보드"];

const LoginPage = () => {
  const { playerName, setPlayerName, ready, toggleReady } = useBattleStore();
  return (
    <main className="min-h-screen bg-sand text-ink">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-ember">
          HotSix Game Project
        </p>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Keyboard Warrior
              <br />
              Battle Royale
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/80">
              빠른 입력과 순간 판단으로 마지막 한 명이 남을 때까지 살아남는 실시간 타이핑
              배틀로얄입니다.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {cards.map((card) => (
                <article
                  className="rounded-3xl border border-ink/10 bg-white px-5 py-6 shadow-[0_16px_40px_rgba(16,24,32,0.08)]"
                  key={card}
                >
                  <p className="text-sm font-medium text-ink/70">Core Feature</p>
                  <h2 className="mt-2 text-xl font-bold">{card}</h2>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] bg-ink p-8 text-sand shadow-[0_24px_60px_rgba(16,24,32,0.22)]">
            <p className="text-sm uppercase tracking-[0.25em] text-sand/70">Lobby Preview</p>
            <label className="mt-8 block text-sm font-medium text-sand/80" htmlFor="playerName">
              플레이어 이름
            </label>
            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none transition focus:border-ember"
              id="playerName"
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="닉네임을 입력하세요"
              value={playerName}
            />

            <button
              className="mt-5 w-full rounded-2xl bg-ember px-4 py-3 text-base font-bold text-white transition hover:brightness-105"
              onClick={toggleReady}
              type="button"
            >
              {ready ? "준비 취소" : "준비 완료"}
            </button>

            <div className="mt-8 rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-sand/70">현재 상태</p>
              <p className="mt-2 text-2xl font-bold">{ready ? "매칭 대기 중" : "대기실 입장 전"}</p>
              <p className="mt-3 text-sm text-sand/80">
                React Query는 서버 상태를, Zustand는 로컬 게임 상태를 담당하도록 시작 구조를
                분리했습니다.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
