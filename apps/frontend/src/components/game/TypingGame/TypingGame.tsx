import clsx from "clsx";
import hangul from "hangul-js";
import { useEffect, useRef, useState } from "react";

import HeartStatus from "@/components/game/HeartStatus";
import { FONT_SIZE_CLASS } from "@/constants/game/font";
import type { FontSize, MatchState } from "@/types";

type TypingGameProps = {
  prompt: string;
  life: number;
  onInputChange: (
    input: string,
    correctCount?: number,
    completedTypingCount?: number,
    completedCorrectCount?: number,
  ) => void;
  onWrongInput?: () => void;
};

function getMatchState(
  input: string | undefined,
  target: string | undefined,
  isLastIndex?: boolean,
): MatchState {
  if (!input) return "untyped";
  if (!target) return "wrong";

  const disassembledInput = hangul.disassemble(input).join("");
  const disassembledTarget = hangul.disassemble(target).join("");

  if (input === target) return "correct";

  if (disassembledTarget.startsWith(disassembledInput) && isLastIndex) {
    return "composing";
  }

  return "wrong";
}

const TypingGame = ({ prompt, life, onInputChange, onWrongInput }: TypingGameProps) => {
  const lines = prompt.split("\n");

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  const [lineIndex, setLineIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [fontSize] = useState<FontSize>("medium");
  const [isComposing, setIsComposing] = useState(false);
  const [completedTypingCount, setCompletedTypingCount] = useState(0);
  const [completedCorrectCount, setCompletedCorrectCount] = useState(0);

  const visibleLines = lines.slice(lineIndex, lineIndex + 4);
  const currentLine = lines[lineIndex] ?? "";
  const isGameOver = life <= 0 || lineIndex >= lines.length;

  useEffect(() => {
    const handleGlobalClick = () => inputRef.current?.focus();

    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    if (!cursorRef.current || !containerRef.current) return;
    if (currentInput.length <= 0) return;

    const cursor = cursorRef.current.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();

    const threshold = container.top + container.height * 0.5;

    if (cursor.top > threshold) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollTop + (cursor.top - threshold),
        behavior: "smooth",
      });
    }
  }, [currentInput.length]);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false);

    const inputValue = e.currentTarget.value;

    onInputChange(
      inputValue,
      getCorrectCount(inputValue),
      completedTypingCount,
      completedCorrectCount,
    );
  };

  const getCorrectCount = (inputText: string) => {
    return Array.from(inputText).reduce((count, char, index) => {
      const targetChar = currentLine[index];

      if (getMatchState(char, targetChar, false) === "correct") {
        return count + 1;
      }

      return count;
    }, 0);
  };

  const moveNextLine = () => {
    const currentCorrectCount = getCorrectCount(currentInput);

    setCompletedTypingCount((prev) => prev + currentInput.length);

    setCompletedCorrectCount((prev) => prev + currentCorrectCount);

    setLineIndex((prev) => Math.min(prev + 1, lines.length));

    setCurrentInput("");
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (newValue.includes("\n")) {
      moveNextLine();

      return;
    }

    const lastCharIndex = newValue.length - 1;
    const isLastIndex = lastCharIndex === currentInput.length;

    if (newValue.length > currentInput.length) {
      const currentChar = newValue[lastCharIndex];
      const targetChar = currentLine[lastCharIndex];

      if (getMatchState(currentChar, targetChar, isLastIndex) === "wrong") {
        onWrongInput?.();
      }
    }
    setCurrentInput(newValue);

    if (!isComposing) {
      onInputChange(
        newValue,
        getCorrectCount(newValue),
        completedTypingCount,
        completedCorrectCount,
      );
    }
  };

  return (
    <div className="flex min-w-0 w-full max-w-[916px] flex-col gap-3 border-[4px] border-black bg-surface-sub p-3 shadow-[8px_8px_0px_#000] sm:gap-4 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="text-xl text-text">⌨️</div>

        <HeartStatus life={life} />
      </div>

      <div className="border-[4px] border-black bg-surface-main p-6">
        <div ref={containerRef} className="h-[clamp(160px,28vh,240px)] w-full overflow-hidden">
          <div className="whitespace-pre-wrap break-keep text-[clamp(18px,2vw,24px)] leading-[2.5]">
            {visibleLines.map((line, visibleLineIndex) => {
              const isCurrentLine = visibleLineIndex === 0;

              const lineKey = `line-${lineIndex + visibleLineIndex}`;

              return (
                <p key={lineKey}>
                  {Array.from(line).map((char, charIndex) => {
                    const charKey = `${lineKey}-${charIndex}-${char.charCodeAt(0)}`;

                    if (!isCurrentLine) {
                      return (
                        <span key={charKey} className="text-gray-500">
                          {char}
                        </span>
                      );
                    }

                    const isLastIndex = charIndex === currentInput.length - 1;

                    const state =
                      charIndex < currentInput.length
                        ? getMatchState(currentInput[charIndex], char, isLastIndex)
                        : charIndex === currentInput.length
                          ? getMatchState(
                              currentInput[currentInput.length - 1],
                              currentLine[currentInput.length - 1],
                              true,
                            ) === "composing"
                            ? "untyped"
                            : "cursor"
                          : "untyped";

                    return (
                      <span
                        ref={charIndex === currentInput.length - 1 ? cursorRef : null}
                        key={charKey}
                        className={clsx(
                          FONT_SIZE_CLASS[fontSize],
                          state === "correct" && "text-green-400",
                          state === "composing" && "text-yellow-400",
                          state === "wrong" && "text-red-400",
                          state === "cursor" && "bg-yellow-300 text-black",
                          state === "untyped" && "text-text",
                        )}
                      >
                        {char}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <textarea
        value={currentInput}
        onChange={handleInputChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        ref={inputRef}
        placeholder={isGameOver ? "Game Over" : "Start typing here..."}
        disabled={isGameOver}
        className="h-[clamp(48px,7vh,60px)] w-full resize-none border-[4px] border-black bg-surface-main px-4 py-3 text-[clamp(16px,1.6vw,20px)] font-bold text-text placeholder:text-text/50 outline-none disabled:bg-surface-sub"
      />
    </div>
  );
};

export default TypingGame;
