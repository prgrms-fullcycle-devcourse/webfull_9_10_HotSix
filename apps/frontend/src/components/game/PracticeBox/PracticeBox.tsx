import { Keyboard } from "lucide-react";

type PracticeBoxProps = {
  text?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function PracticeBox({
  text = "연습하는 공간입니다.",
  value = "",
  onChange,
}: PracticeBoxProps) {
  return (
    <section className="flex flex-col w-[900px] bg-[#454545] border-[4px] border-black shadow-[8px_8px_0px_#000] p-6 gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-white text-xl">
          <Keyboard size={28} />
          <h2 className="text-2xl font-semibold">연습장</h2>
        </div>
      </div>

      <div className="border-[4px] border-black bg-[#3b3b3b] p-6">
        <div className="w-full h-[240px] overflow-hidden">
          <p className="whitespace-pre-wrap break-keep leading-[2.5] text-[24px] text-white">
            {text}
          </p>
        </div>
      </div>

      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="Start typing here..."
        className="w-full h-[60px] border-[4px] border-black bg-gray-200 px-4 text-[20px] text-black outline-none placeholder:text-gray-400"
      />
    </section>
  );
}
