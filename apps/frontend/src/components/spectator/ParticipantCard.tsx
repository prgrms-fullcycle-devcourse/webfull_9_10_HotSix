import HeartIcons from "../common/HeartIcons";
import ProgressBar from "../common/ProgressBar";

interface Props {
  nickname: string;
  progress: number;
  wpm: number;
  typedLength: number;
  promptText?: string;
  life: number;
}

const ParticipantCard = ({
  nickname,
  progress,
  wpm,
  typedLength,
  promptText = "",
  life,
}: Props) => {
  const renderPromptProgress = (text = "", typedLength = 0) => {
    const safeTypedLength = Math.max(0, typedLength);

    const correct = text.slice(0, safeTypedLength);
    const rest = text.slice(safeTypedLength);

    return (
      <span>
        <span className="text-state-active">{correct}</span>
        <span className="text-gray-500">{rest}</span>
      </span>
    );
  };

  return (
    <div className="w-full max-w-[320px]">
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="max-w-[210px] truncate text-sm font-semibold text-white">{nickname}</span>

        <HeartIcons life={life} size="md" />
      </div>

      <div
        className="
          flex
          h-[260px]
          w-full
          flex-col
          border-[3px]
          border-black
          bg-[#2f2f2f]
          px-4
          py-3
          shadow-[6px_6px_0_#000]
        "
      >
        <div
          className="
            mb-3
            flex-1
            overflow-y-auto
            pr-2
            text-sm
            leading-snug

            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-[#242424]
            [&::-webkit-scrollbar-thumb]:bg-[#777]
            [&::-webkit-scrollbar-thumb]:border
            [&::-webkit-scrollbar-thumb]:border-black
          "
        >
          {renderPromptProgress(promptText, typedLength)}
        </div>

        <div className="shrink-0">
          <div className="mb-1 text-xs text-gray-300">
            WPM: <span className="text-white">{wpm}</span>
          </div>

          <ProgressBar progress={progress} />
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;
