import type { GameProgressProps, StatusItemProps } from "@/types";

function StatusItem({ label, value, unit, color }: StatusItemProps) {
  return (
    <div className="flex h-[88px] min-w-0 flex-col items-center justify-center border-4 border-white bg-[#333333] shadow-[8px_8px_0_#000]">
      <p className={`mb-2 text-sm font-semibold ${color}`}>{label}</p>

      <p className="text-xl font-semibold text-white">
        {value}
        {unit && <span className="ml-1 text-sm font-normal">{unit}</span>}
      </p>
    </div>
  );
}

export default function GameProgress({
  typingCount,
  accuracy,
  time,
  isWaiting = false,
}: GameProgressProps) {
  return (
    <section className="w-full max-w-[916px] border-4 border-black bg-[#454545] px-4 py-4 shadow-[8px_8px_0_#000] md:px-[22px] md:py-[19px]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {isWaiting ? (
          <>
            <StatusItem label="우승자" value={accuracy} color="text-yellow-400" />
            <StatusItem label="참여자" value={typingCount} unit="명" color="text-cyan-400" />
            <StatusItem label="시간" value={time} color="text-emerald-400" />
          </>
        ) : (
          <>
            <StatusItem label="타수" value={typingCount} unit="타" color="text-red-400" />
            <StatusItem label="정확도" value={accuracy} unit="%" color="text-emerald-400" />
            <StatusItem label="시간" value={time} color="text-yellow-300" />
          </>
        )}
      </div>
    </section>
  );
}
