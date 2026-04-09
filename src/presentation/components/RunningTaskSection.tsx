import { useState } from "react";
import { Play, Pause, Square, Pencil, X, CheckCircle2, Clock } from "lucide-react";
import type { Project } from "@domain/entities/Project";
import type { Category } from "@domain/entities/Category";
import { useRunningTask } from "@presentation/contexts/RunningTaskContext";
import { useTaskTimer } from "@presentation/hooks/useTaskTimer";
import { RunningTaskEditForm } from "./RunningTaskEditForm";
import { formatHHMMSS, formatTimeOfDay } from "@shared/utils/time";

interface RunningTaskSectionProps {
  projects: Project[];
  categories: Category[];
}

export function RunningTaskSection({ projects, categories }: RunningTaskSectionProps) {
  const { runningTask, pauseTask, resumeTask, stopTask, cancelTask, updateActiveTask } =
    useRunningTask();
  const seconds = useTaskTimer(runningTask);
  const [editing, setEditing] = useState(false);
  const [confirmingStop, setConfirmingStop] = useState(false);

  if (!runningTask) return null;

  const isRunning = runningTask.status === "running";
  const displayName = runningTask.name ?? "(sem nome)";
  const project = projects.find((p) => p.id === runningTask.projectId);
  const category = categories.find((c) => c.id === runningTask.categoryId);

  async function handlePlayPause() {
    if (isRunning) await pauseTask();
    else await resumeTask();
  }

  async function handleStopConfirm(completed: boolean) {
    setConfirmingStop(false);
    setEditing(false);
    await stopTask(completed);
  }

  async function handleSaveEdit(data: {
    name: string | null;
    projectId: string | null;
    categoryId: string | null;
    billable: boolean;
  }) {
    await updateActiveTask(data);
    setEditing(false);
  }

  return (
    <section className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                runningTask.billable ? "bg-blue-400" : "bg-gray-500"
              }`}
            />
            <span className="text-sm font-medium text-gray-100 truncate">{displayName}</span>
          </div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            {project && <span>{project.name}</span>}
            {category && <span>{category.name}</span>}
            <span>início {formatTimeOfDay(runningTask.startTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-lg font-mono text-gray-100 mr-2">{formatHHMMSS(seconds)}</span>
          {confirmingStop ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 mr-1">Concluída?</span>
              <button
                onClick={() => handleStopConfirm(true)}
                title="Concluída"
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-700 hover:bg-green-600 text-white rounded transition-colors"
              >
                <CheckCircle2 size={12} />
                Sim
              </button>
              <button
                onClick={() => handleStopConfirm(false)}
                title="Pendente"
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
              >
                <Clock size={12} />
                Não
              </button>
              <button
                onClick={() => setConfirmingStop(false)}
                className="p-1 text-gray-600 hover:text-gray-400 rounded"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handlePlayPause}
                title={isRunning ? "Pausar" : "Retomar"}
                className="p-1.5 text-gray-400 hover:text-gray-100 rounded hover:bg-gray-800"
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={() => setConfirmingStop(true)}
                title="Parar"
                className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-gray-800"
              >
                <Square size={16} />
              </button>
              <button
                onClick={() => setEditing((v) => !v)}
                title="Editar"
                className={`p-1.5 rounded hover:bg-gray-800 ${editing ? "text-blue-400" : "text-gray-400 hover:text-gray-100"}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => cancelTask()}
                title="Cancelar tarefa"
                className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-gray-800"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <RunningTaskEditForm
          task={runningTask}
          projects={projects}
          categories={categories}
          onSave={handleSaveEdit}
          onCancel={() => setEditing(false)}
        />
      )}
    </section>
  );
}
