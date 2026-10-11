import { SparklesIcon, VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall, handleOpenAi }) {
  return (
    <div className="p-3 border-b flex items-center justify-end gap-2 max-w-7xl mx-auto w-full absolute top-0 z-20 pointer-events-none">
      {handleOpenAi && (
        <button
          onClick={handleOpenAi}
          className="btn btn-primary btn-sm text-white pointer-events-auto gap-1.5 shadow-sm"
          title="Open Gemini AI Language Assistant"
        >
          <SparklesIcon className="size-4" />
          <span className="hidden sm:inline text-xs font-semibold">AI Tools</span>
        </button>
      )}
      <button
        onClick={handleVideoCall}
        className="btn btn-success btn-sm text-white pointer-events-auto shadow-sm"
        title="Start Video Call"
      >
        <VideoIcon className="size-5" />
      </button>
    </div>
  );
}

export default CallButton;