import HeartIcons from "../common/HeartIcons";
import ProgressBar from "../common/ProgressBar";

interface Props {
  nickname: string;
  progress: number;
  wpm: number;
  acceptedLength: number;
  promptText: string;
  life: number;
}

const ParticipantCard = ({ nickname, progress, wpm, acceptedLength, promptText, life }: Props) => {
  // 테스트
  // const [testLength, setTestLength] = useState(0);

  //   useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTestLength((prev) => {
  //       if (prev >= promptText.length) return prev; // 끝나면 멈춤
  //       return prev + 1;
  //     });
  //   }, 70); // 👉 속도 조절 (작을수록 빠름)

  //   return () => clearInterval(interval);
  // }, [promptText]);

  const getVisibleText = (text: string, typedLength: number, maxLines = 4) => {
    const charsPerLine = 24;

    const currentLine = Math.floor(typedLength / charsPerLine);

    const half = Math.floor(maxLines / 2);

    const startLine = Math.max(0, currentLine - half);
    const endLine = currentLine + 1;

    const startIdx = startLine * charsPerLine;
    const endIdx = endLine * charsPerLine;

    return {
      visibleText: text.slice(startIdx, endIdx),
      startIdx,
    };
  };

  const renderPromptProgress = (text = "", acceptedLength = 0) => {
    const { visibleText, startIdx } = getVisibleText(text, acceptedLength, 4);

    const relativeTyped = acceptedLength - startIdx;

    const correct = visibleText.slice(0, relativeTyped);
    const rest = visibleText.slice(relativeTyped);

    return (
      <div>
        <span className="text-state-active">{correct}</span>
        <span className="text-gray-500">{rest}</span>
      </div>
    );
  };

  return (
    <div className="w-full">
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
        <div
          className="text-[14px] mb-5 leading-relaxed break-all"
          style={{
            height: "6.5em",
            overflow: "hidden",
          }}
        >
          {renderPromptProgress(promptText, acceptedLength)}
          {/* 테스트 */}
          {/* {renderPromptProgress(promptText,testLength )} */}
        </div>

        <div className="mb-0 text-xs text-gray-300">
          WPM: <span className="text-white">{wpm}</span>
        </div>
        <ProgressBar progress={progress} />

        {/* 테스트 */}
        {/* <ProgressBar
          progress={
            promptText.length === 0
              ? 0
              : (testLength / promptText.length) * 100
          }
        /> */}
      </div>
    </div>
  );
};

export default ParticipantCard;
