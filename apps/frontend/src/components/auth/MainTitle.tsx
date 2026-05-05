export default function MainTitle() {
  return (
    <div className="w-full dark">
      <div className="h-3 bg-surface-sub" />
      <div className="h-3 bg-dash-red-white" />

      <div className="flex flex-col bg-surface-sub min-h-[300px] text-6xl md:text-8xl">
        <div className="flex flex-1 justify-center items-center">
          <h1 className="font-pixel text-point-yellow">KEYBOARD</h1>
        </div>

        <div className="h-3 shrink-0 bg-dash-white" />

        <div className="flex flex-1 flex-row items-center justify-center gap-4">
          <h1 className="font-pixel text-point-red">BATTLE</h1>
          <h1 className="font-pixel text-point-mint">ROYALE</h1>
        </div>
      </div>

      <div className="h-3 bg-dash-red-white" />
      <div className="h-3 bg-surface-sub" />
    </div>
  );
}
