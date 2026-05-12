import HeartIcons from "../common/HeartIcons";
import ProgressBar from "../common/ProgressBar";

interface Props {
  nickname: string;
  progress: number;
  wpm: number;
  typedLength: number;
  promptText: string;
  life: number;
}

const ParticipantCard = ({ nickname, progress, wpm, typedLength, promptText, life }: Props) => {
  const renderPromptProgress = (text: string, typedLength: number) => {
    const correct = text.slice(0, typedLength);
    const rest = text.slice(typedLength);

    return (
      <span>
        <span className="text-state-active">{correct}</span>
        <span className="text-gray-500">{rest}</span>
      </span>
    );
  };

  return (
    <div>
      {/* 상단: 닉네임 + 하트 */}
      <div className="flex justify-between items-center mb-1 px-2">
        <span className="text-white text-sm font-semibold">{nickname}</span>

        <HeartIcons life={life} size="md" />
      </div>
      <div
        className="
                w-full max-w-[320px]
                bg-[#2f2f2f]
                px-4 py-3
                border-[3px] border-black
                shadow-[6px_6px_0_#000]
            "
      >
        {/* 문장 진행 표시 */}
        <div className="text-sm mb-14 leading-snug">
          {renderPromptProgress(promptText, typedLength)}
        </div>

        <div className="text-xs text-gray-300">
          WPM: <span className="text-white">{wpm}</span>
        </div>

        {/* 진행 바 */}
        <ProgressBar progress={progress} />
      </div>
    </div>
  );
};

export default ParticipantCard;
