import Loader from "@/components/Loader";

export default function ConversationLoading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <Loader size="lg" color="blue" />
        <span className="text-sm text-slate-400 font-medium animate-pulse">
          Loading conversation...
        </span>
      </div>
    </div>
  );
}
