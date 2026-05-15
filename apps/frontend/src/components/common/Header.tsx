type Props = {
  onBack?: () => void;
};

export default function Header({ onBack }: Props) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    window.history.back();
  };

  return (
    <div
      className="fixed flex items-center justify-start top-0 z-10 w-full max-w-200 h-[4.7rem] pl-[2rem] pr-[2rem] shadow-bottom
        max-sm2:h-[4rem] max-sm2:pl-[1rem] max-sm2:pr-[1rem]"
    >
      <button type="button" onClick={handleBack}>
        <div className="text-text">뒤로</div>
      </button>
    </div>
  );
}
