import { Clock } from "lucide-react";
import { usePlannedTasksForDate } from "@presentation/hooks/usePlannedTasks";
import { todayISO } from "@shared/utils/time";

interface CompactOverlayContentProps {
  onExpand: () => void;
  onStartTask: (input: {
    name?: string | null;
    projectId?: string | null;
    categoryId?: string | null;
    billable: boolean;
  }) => Promise<void>;
}

export function CompactOverlayContent({ onExpand, onStartTask }: CompactOverlayContentProps) {
  const today = todayISO();
  const { tasks } = usePlannedTasksForDate(today);

  const pendingCount = tasks.filter((t) => !t.completedDates.includes(today)).length;

  async function handleClick() {
    if (pendingCount > 0) {
      onExpand();
    } else {
      await onStartTask({ billable: true });
    }
  }

  return (
    <div
      data-tauri-drag-region
      className="w-full h-full relative cursor-move"
      title={pendingCount > 0 ? "Ver tarefas planejadas" : "Iniciar nova tarefa"}
    >
      {/* Fundo circular — drag region */}
      <div className="absolute inset-0 bg-gray-900 border border-gray-700 rounded-full shadow-xl" />

      {/* Ícone + badge — clicável */}
      <button
        onClick={handleClick}
        className="absolute inset-0 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
      >
        <Clock size={18} className="text-gray-300" />
      </button>

      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none z-10">
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      )}
    </div>
  );
}
