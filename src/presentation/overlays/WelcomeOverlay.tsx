import { CalendarDays, Plus } from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

interface WelcomeOverlayProps {
  userName: string;
  onNavigatePlanning: () => void;
  onNewTask: () => void;
}

export function WelcomeOverlay({ userName, onNavigatePlanning, onNewTask }: WelcomeOverlayProps) {
  const greeting = getGreeting();
  const displayName = userName.trim() || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-6 min-w-[320px]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-100">
            {greeting}{displayName ? `, ${displayName}` : ""}!
          </h1>
          <p className="text-sm text-gray-400 mt-1">No que iremos trabalhar hoje?</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onNavigatePlanning}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg transition-colors text-sm font-medium"
          >
            <CalendarDays size={16} />
            Planejamento
          </button>
          <button
            onClick={onNewTask}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Nova tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
