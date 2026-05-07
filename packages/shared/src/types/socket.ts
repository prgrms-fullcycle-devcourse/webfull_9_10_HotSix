export type TypingProgressPayload = {
  roomId: string;
  playerId: string;

  inputText: string;

  currentIndex: number;

  typedCharCount: number;
  correctCharCount: number;
  wrongCharCount: number;

  cpm: number;
  wpm: number;

  accuracy: number;
  progress: number;
};

export type PlayerProgressUpdatedPayload = {
  playerId: string;

  currentIndex: number;

  cpm: number;
  wpm: number;

  accuracy: number;
  progress: number;
};

export type PlayerFinishedPayload = {
  playerId: string;

  rank: number;

  cpm: number;
  wpm: number;

  accuracy: number;

  finishedAt: number;
};
