import { Keyboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PracticeMessage = {
  id: string;
  text: string;
};

type PracticeBoxProps = {
  initialMessages?: PracticeMessage[];
};

export default function PracticeBox({ initialMessages = [] }: PracticeBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<PracticeMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  });

  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const trimmed = inputValue.trim();

    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmed,
      },
    ]);

    setInputValue("");
  };

  return (
    <section className="bg-surface-sub flex w-full max-w-[916px] flex-col gap-4 border-[4px] border-black p-4 shadow-[8px_8px_0px_#000] sm:p-6">
      <button
        type="button"
        onClick={handleFocusInput}
        className="text-text flex cursor-text items-center gap-4 text-left"
      >
        <Keyboard size={28} />
        <h2 className="text-[clamp(22px,2vw,32px)] font-semibold">연습장</h2>
      </button>

      <button
        type="button"
        onClick={handleFocusInput}
        className="bg-surface-main block border-[4px] border-black p-4 text-left sm:p-6"
      >
        <div ref={scrollRef} className="h-[clamp(180px,28vh,240px)] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <p
                key={message.id}
                className="text-text whitespace-pre-wrap break-keep text-[clamp(18px,1.8vw,24px)] leading-[1.45]"
              >
                {message.text}
              </p>
            ))}
          </div>
        </div>
      </button>

      <input
        ref={inputRef}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="메시지를 입력하세요..."
        className="bg-surface-main text-text h-[clamp(48px,7vh,60px)] w-full border-[4px] border-black px-4 text-[clamp(16px,1.6vw,20px)] outline-none placeholder:text-text/50"
      />
    </section>
  );
}
