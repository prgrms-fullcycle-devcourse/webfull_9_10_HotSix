import clsx from "clsx";
import hangul from "hangul-js";
import { useEffect, useRef, useState } from "react";

type FontSize = "small" | "medium" | "large";
type MatchState = "correct" | "wrong" | "composing" | "untyped";

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
  if (disassembledTarget.startsWith(disassembledInput) && isLastIndex) return "composing";
  //}

  return "wrong";
}

const Game = () => {
  const target =
    "안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf안녕하세요asdf";

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const [inputText, setInputText] = useState("");
  const [wrongCount, setWrongCount] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  useEffect(() => {
    const handleGlobalClick = () => inputRef.current?.focus();
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    if (!cursorRef.current || !containerRef.current) return;

    if (inputText.length <= 0) return;

    const cursor = cursorRef.current.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();

    const threshold = container.top + container.height * 0.5;

    if (cursor.top > threshold) {
      containerRef.current.scrollTop += cursor.top - threshold;
    }
  }, [inputText.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: WheelEvent | TouchEvent) => e.preventDefault();

    container.addEventListener("wheel", preventScroll, { passive: false });
    container.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      container.removeEventListener("wheel", preventScroll);
      container.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const lastCharIndex = e.target.value.length - 1;
    const isLastIndex = lastCharIndex - 1 === inputText.length - 1;

    if (newValue.length > inputText.length) {
      const currentChar = newValue[lastCharIndex];
      const targetChar = target[lastCharIndex];

      if (inputText.length > 0) {
        const prevPos = inputText.length - 1;

        if (getMatchState(inputText[prevPos], target[prevPos]) === "wrong") {
          setWrongCount((prev) => prev + 1);
        }
      }

      if (getMatchState(currentChar, targetChar, isLastIndex) === "wrong") {
        setWrongCount((prev) => prev + 1);
      }
    }
    setInputText(e.target.value);
  };

  return (
    <div className="flex-1 w-full h-full bg-white">
      <div className="flex p-1 items-center justify-between bg-ink text-sand">
        <div className="relative group">
          <div className="block p-4 w-40 text-center text-base font-medium text-sand/80 group-hover:bg-red-600">
            글자 크기: {fontSize}
          </div>
          <div className="absolute flex-col -bottom-30 z-20 w-full left-0 bg-ink text-sand shadow-[0_24px_60px_rgba(16,24,32,0.22)] hidden group-hover:flex">
            <button
              type="button"
              onClick={() => setFontSize("small")}
              className="p-1 hover:bg-red-600"
            >
              small
            </button>
            <button
              type="button"
              onClick={() => setFontSize("medium")}
              className="p-1 hover:bg-red-600"
            >
              medium
            </button>
            <button
              type="button"
              onClick={() => setFontSize("large")}
              className="p-1 hover:bg-red-600"
            >
              large
            </button>
          </div>
        </div>
      </div>
      <h2>{wrongCount}</h2>
      <div className="overflow-hidden relative">
        <input
          onChange={handleInputChange}
          ref={inputRef}
          className="absolute opacity-0 pointer-events-none"
        />
        <div
          ref={containerRef}
          className="w-full h-dvh overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <p>
            {target.split("").map((char, index) => {
              const isLastIndex = index === inputText.length - 1;
              const state =
                index < inputText.length
                  ? getMatchState(inputText[index], char, isLastIndex)
                  : index === inputText.length
                    ? getMatchState(
                        inputText[inputText.length - 1],
                        target[inputText.length - 1],
                        true,
                      ) === "composing"
                      ? "untyped"
                      : "cursor"
                    : "untyped";
              return (
                <span
                  ref={index === inputText.length - 1 ? cursorRef : null}
                  key={char + index.toString()}
                  className={clsx(
                    fontSize === "small" && "text-base",
                    fontSize === "medium" && "text-xl",
                    fontSize === "large" && "text-3xl",
                    state === "correct" && "text-green-600",
                    state === "composing" && "text-yellow-500",
                    state === "wrong" && "text-red-600 bg-red-100",
                    state === "cursor" && "text-ink bg-black/20 animate-pulse",
                    state === "untyped" && "text-ink/30",
                  )}
                >
                  {char}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Game;
