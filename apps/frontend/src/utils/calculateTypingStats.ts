//프론트 계산 유틸
type CalculateTypingStatsParams = {
  targetText: string;
  inputText: string;
  startedAt: number;
};

export type TypingStats = {
  typedCharCount: number;
  correctCharCount: number;
  wrongCharCount: number;

  cpm: number;
  wpm: number;

  accuracy: number;
  progress: number;
};

export const calculateTypingStats = ({
  targetText,
  inputText,
  startedAt,
}: CalculateTypingStatsParams): TypingStats => {
  const elapsedMs = Date.now() - startedAt;

  const elapsedMinutes = elapsedMs / 1000 / 60;

  const typedCharCount = inputText.length;

  let correctCharCount = 0;

  for (let i = 0; i < inputText.length; i++) {
    if (inputText[i] === targetText[i]) {
      correctCharCount++;
    }
  }

  const wrongCharCount = typedCharCount - correctCharCount;

  const cpm = elapsedMinutes <= 0 ? 0 : Math.round(typedCharCount / elapsedMinutes);

  const wpm = Math.round(cpm / 5);

  const accuracy =
    typedCharCount === 0 ? 100 : Math.round((correctCharCount / typedCharCount) * 100);

  const progress = Math.min(100, Math.round((typedCharCount / targetText.length) * 100));

  return {
    typedCharCount,
    correctCharCount,
    wrongCharCount,
    cpm,
    wpm,
    accuracy,
    progress,
  };
};
