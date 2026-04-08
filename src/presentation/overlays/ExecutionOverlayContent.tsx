import { Play, Pause, Square } from "lucide-react";
import type { Task } from "@domain/entities/Task";
import { useTaskTimer } from "@presentation/hooks/useTaskTimer";
import { formatHHMMSS } from "@shared/utils/time";

interface ExecutionOverlayContentProps {
  task: Task;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function ExecutionOverlayContent({
  task,
  onPause,
  onResume,
  onStop,
}: ExecutionOverlayContentProps) {
  const seconds = useTaskTimer(task);
  const isRunning = task.status === "running";
  const displayName = task.name ?? "(sem nome)";

  return (
    <div
      className={`w-full h-full flex items-center gap-3 bg-gray-900 border-l-4 rounded-lg shadow-xl px-4 ${
        task.billable ? "border-l-blue-500" : "border-l-gray-600"
      }`}
    >
      {/* Drag handle — área de nome + timer */}
      <div data-tauri-drag-region className="flex-1 min-w-0 cursor-move select-none">
        <p className="text-sm font-medium text-gray-100 truncate pointer-events-none">
          {displayName}
        </p>
        <p className="text-lg font-mono text-gray-200 pointer-events-none">
          {formatHHMMSS(seconds)}
        </p>
      </div>

      {/* Botões interativos */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={isRunning ? onPause : onResume}
          className="p-1.5 text-gray-400 hover:text-gray-100 rounded hover:bg-gray-800"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={onStop}
          className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-gray-800"
        >
          <Square size={16} />
        </button>
      </div>
    </div>
  );
}
