import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Maximize2 } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import type { Task } from "@domain/entities/Task";
import { useTaskTimer } from "@presentation/hooks/useTaskTimer";

const COMPACT_W = 62;
const COMPACT_H = 62;
const EXPANDED_W = 280;
const EXPANDED_H = 80;

interface CompactExecutionOverlayContentProps {
  task: Task;
  projectName: string | null;
  onPause: () => void;
  onResume: () => void;
  onStop: (completed: boolean) => void;
  onExpand: () => void; // volta para o execution overlay normal
}

export function CompactExecutionOverlayContent({
  task,
  projectName,
  onPause,
  onResume,
  onStop,
  onExpand,
}: CompactExecutionOverlayContentProps) {
  const seconds = useTaskTimer(task);
  const isRunning = task.status === "running";
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const didMoveRef = useRef(false);
  const isMouseDownRef = useRef(false);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const displayName = task.name ?? "(sem nome)";

  // Expande/retrai a janela ao hover, mostrando conteúdo só depois do resize
  useEffect(() => {
    const win = getCurrentWindow();
    if (isHovered) {
      win.setSize(new LogicalSize(EXPANDED_W, EXPANDED_H)).then(() => setIsExpanded(true));
    } else {
      setIsExpanded(false);
      win.setSize(new LogicalSize(COMPACT_W, COMPACT_H));
    }
  }, [isHovered]);

  // Mesmo padrão de didMoveRef do ExecutionOverlayContent:
  // só marca drag quando o mouse está pressionado.
  useEffect(() => {
    const handleMouseUp = () => { isMouseDownRef.current = false; };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    const unlisten = getCurrentWindow().listen("tauri://move", () => {
      if (isMouseDownRef.current) {
        didMoveRef.current = true;
      }
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  const borderColor = task.billable ? "border-l-blue-500" : "border-l-gray-600";

  return (
    <div
      data-tauri-drag-region
      onMouseDown={() => { isMouseDownRef.current = true; didMoveRef.current = false; }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full h-full bg-gray-900 border border-gray-700 border-l-4 shadow-xl select-none overflow-hidden ${
        isExpanded ? "rounded-lg" : "rounded-2xl"
      } ${borderColor}`}
    >
      {isExpanded ? (
        /* Modo hover — igual ao ExecutionOverlay mas com botão de expansão */
        <div className="flex items-center gap-2 w-full h-full px-3">
          <div className="flex-1 min-w-0 flex flex-col">
            <p className="text-[11px] text-gray-400 truncate leading-tight">
              {projectName ? `${displayName} · ${projectName}` : displayName}
            </p>
            <p className="text-xl font-mono font-semibold text-gray-100 leading-tight">
              {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
            </p>
          </div>

          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={isRunning ? onPause : onResume}
              className="p-1.5 text-gray-400 hover:text-gray-100 rounded hover:bg-gray-800 transition-colors"
              title={isRunning ? "Pausar" : "Retomar"}
            >
              {isRunning ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              onClick={() => onStop(true)}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-gray-800 transition-colors"
              title="Parar"
            >
              <Square size={15} />
            </button>
          </div>

          <button
            onClick={onExpand}
            className="p-1.5 text-gray-600 hover:text-gray-300 rounded hover:bg-gray-800 transition-colors shrink-0"
            title="Expandir overlay"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      ) : (
        /* Modo idle — relógio compacto 62×62 */
        <div className="w-full h-full flex flex-col justify-between p-2">
          {/* Horas */}
          <p className="text-2xl font-mono font-bold text-gray-100 leading-none">
            {String(h).padStart(2, "0")}
          </p>

          {/* Minutos + segundos */}
          <div className="flex items-end justify-between">
            <p className="text-2xl font-mono font-bold text-gray-100 leading-none">
              {String(m).padStart(2, "0")}
            </p>
            <p className="text-[10px] font-mono text-gray-500 leading-none pb-[1px]">
              {String(s).padStart(2, "0")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
