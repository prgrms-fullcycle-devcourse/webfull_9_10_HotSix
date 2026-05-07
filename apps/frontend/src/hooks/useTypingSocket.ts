import throttle from "lodash.throttle";
import { useCallback } from "react";

import { socket } from "@/lib/socket";
import { calculateTypingStats } from "@/utils/calculateTypingStats";

type EmitTypingProgressParams = {
  roomId: string;
  playerId: string;
  targetText: string;
  inputText: string;
  startedAt: number;
};

export const useTypingSocket = () => {
  const emitTypingProgress = useCallback(
    throttle(({ roomId, playerId, targetText, inputText, startedAt }: EmitTypingProgressParams) => {
      const stats = calculateTypingStats({
        targetText,
        inputText,
        startedAt,
      });

      console.log("emit", {
        roomId,
        playerId,
        inputText,
        currentIndex: inputText.length,
        ...stats,
      });

      socket.emit("game:typing-progress", {
        roomId,
        playerId,
        inputText,
        currentIndex: inputText.length,
        ...stats,
      });
    }, 150),
    [],
  );

  return {
    emitTypingProgress,
  };
};
