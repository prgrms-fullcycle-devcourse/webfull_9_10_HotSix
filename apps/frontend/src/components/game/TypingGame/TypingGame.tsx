import clsx from "clsx";
import hangul from "hangul-js";
import { useEffect, useRef, useState } from "react";

import HeartStatus from "@/components/game/HeartStatus";
import { FONT_SIZE_CLASS } from "@/constants/game/font";
import type { FontSize, MatchState } from "@/types";

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

const TypingGame = () => {
  const lines = [
    "동해물과 백두산이 마르고 닳도록",
    "하느님이 보우하사 우리 나라 만세",
    "무궁화 삼천리 화려강산",
    "대한사람 대한으로 길이 보전하세",
    "남산 위에 저 소나무 철갑을 두른 듯",
    "바람 서리 불변함은 우리 기상일세",
    "무궁화 삼천리 화려강산",
    "대한사람 대한으로 길이 보전하세",
    "가을 하늘 공활한데 높고 구름 없이",
    "밝은 달은 우리 가슴 일편단심일세",
    "무궁화 삼천리 화려강산",
    "대한사람 대한으로 길이 보전하세",
    "이 기상과 이 맘으로 충성을 다하여",
    "괴로우나 즐거우나 나라 사랑하세",
    "무궁화 삼천리 화려강산",
    "대한사람 대한으로 길이 보전하세",
  ];

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  const [lineIndex, setLineIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [life, setLife] = useState(3);
  const [fontSize] = useState<FontSize>("medium");

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

  const moveNextLine = () => {
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
        setLife((prev) => Math.max(prev - 1, 0));
      }
    }

    setCurrentInput(newValue);
  };

  return (
    <div className="flex flex-col w-full max-w-[900px] min-w-0 bg-[#454545] border-[4px] border-black shadow-[8px_8px_0px_#000] p-4 sm:p-6 gap-4">
      <div className="flex justify-between items-center">
        <div className="text-white text-xl">⌨️</div>
        <HeartStatus life={life} />
      </div>

      <div className="border-[4px] border-black bg-[#3b3b3b] p-6">
        <div
          ref={containerRef}
          className="w-full h-[180px] sm:h-[220px] md:h-[240px] overflow-hidden"
        >
          <div className="whitespace-pre-wrap break-keep leading-[2.5] text-[24px]">
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
                          state === "untyped" && "text-white",
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
        ref={inputRef}
        placeholder={isGameOver ? "Game Over" : "Start typing here..."}
        disabled={isGameOver}
        className="w-full h-[60px] border-[4px] border-black bg-gray-200 px-4 py-4 outline-none resize-none disabled:bg-gray-400"
      />
    </div>
  );
};

export default TypingGame;
