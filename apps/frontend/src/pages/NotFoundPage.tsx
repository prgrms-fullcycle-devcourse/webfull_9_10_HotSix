import char1 from "@/assets/icons/char1.svg";
import PixelButton from "@/components/common/PixelButton";

export default function NotFoundPage() {
  return (
    <main className="font-pixel min-h-screen bg-app flex flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-white text-8xl drop-shadow-[4px_4px_0_rgb(0,0,0)]">404</h1>

      <div className="animate-car-bob">
        <img src={char1} alt="lost-page" className="w-20 animate-car-rattle" />
      </div>

      <p className="text-white text-title-md text-center">경로를 다시 확인해 주세요!</p>

      <PixelButton type="button" onClick={() => window.location.reload()}>
        홈으로
      </PixelButton>
    </main>
  );
}
