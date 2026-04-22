import { Clock } from "lucide-react";
import { usePlannedTasksForDate } from "@presentation/hooks/usePlannedTasks";
import { todayISO } from "@shared/utils/time";

interface CompactOverlayContentProps {
  isRunning: boolean;
  isPopupOpen: boolean;
  onMouseDown: () => void;
  onTogglePopup: () => void;
}

export function CompactOverlayContent({
  isRunning,
  isPopupOpen,
  onMouseDown,
  onTogglePopup,
}: CompactOverlayContentProps) {
  const today = todayISO();
  const { tasks } = usePlannedTasksForDate(today);
  const pendingCount = tasks.filter((t) => !t.completedDates.includes(today)).length;

  const borderColor = isPopupOpen ? "border-blue-500" : "border-gray-700";

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full relative cursor-move select-none"
      title={isRunning ? "Ver tarefa em execução" : "Ver tarefas planejadas"}
    >
      {/* Circular background */}
      <div
        className={`absolute inset-0 bg-gray-900 border rounded-full shadow-xl pointer-events-none ${borderColor} transition-colors duration-150`}
      />

      {/* Central button */}
      <button
        onMouseDown={onMouseDown}
        onClick={onTogglePopup}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
      >
        {isRunning ? (
          <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
        ) : (
          <Clock size={16} className="text-blue-400" />
        )}
      </button>

      {/* Grip dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none">
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
      </div>

      {/* Pending badge — idle only */}
      {!isRunning && pendingCount > 0 && (
        <span className="absolute top-0 right-0 min-w-[16px] h-4 px-[3px] bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none z-10">
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      )}
    </div>
  );
}
