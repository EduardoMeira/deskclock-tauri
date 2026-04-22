import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { emit, listen } from "@tauri-apps/api/event";
import type { Task } from "@domain/entities/Task";
import { TaskRepository } from "@infra/database/TaskRepository";
import { pauseTask as pauseTaskUC } from "@domain/usecases/tasks/PauseTask";
import { resumeTask as resumeTaskUC } from "@domain/usecases/tasks/ResumeTask";
import { stopTask as stopTaskUC } from "@domain/usecases/tasks/StopTask";
import { cancelTask as cancelTaskUC } from "@domain/usecases/tasks/CancelTask";
import { ConfigProvider, useAppConfig } from "@presentation/contexts/ConfigContext";
import {
  OVERLAY_EVENTS,
  type RunningTaskChangedPayload,
  type OverlayConfigChangedPayload,
  type TaskStoppedPayload,
} from "@shared/types/overlayEvents";
import { applyFontSize } from "@shared/utils/fontSize";
import { applyTheme } from "@shared/utils/theme";
import type { Theme } from "@shared/utils/theme";
import { ExecutionOverlayContent } from "./ExecutionOverlayContent";
import { useOverlayDrag, restoreOverlayPosition } from "./useOverlayDrag";

const taskRepo = new TaskRepository();
const appWindow = getCurrentWindow();

function ExecutionOverlayAppInner() {
  const config = useAppConfig();
  const [runningTask, setRunningTask] = useState<Task | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const activePlannedTaskId = useRef<string | null>(null);

  useOverlayDrag("overlayPosition_execution", snapToGrid, config);

  useEffect(() => {
    if (!config.isLoaded) return;
    applyFontSize(config.get("fontSize"));
    applyTheme(config.get("theme") as Theme);
    setOverlayOpacity(config.get("overlayOpacity") as number);
    setSnapToGrid(!!config.get("overlaySnapToGrid"));
    // Trava tamanho via min/max: resizable:true é obrigatório no GTK.
    void appWindow.setMinSize(new LogicalSize(220, 40));
    void appWindow.setMaxSize(new LogicalSize(220, 40));
    void restoreOverlayPosition("overlayPosition_execution", config, { width: 220, height: 40 });
  }, [config.isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unlisten = listen<OverlayConfigChangedPayload>(
      OVERLAY_EVENTS.OVERLAY_CONFIG_CHANGED,
      ({ payload }) => {
        if (payload.key === "overlayOpacity") setOverlayOpacity(payload.value as number);
        else if (payload.key === "overlaySnapToGrid") setSnapToGrid(!!payload.value);
        else if (payload.key === "fontSize") applyFontSize(payload.value as string);
        else if (payload.key === "theme") applyTheme(payload.value as Theme);
      }
    );
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  useEffect(() => {
    const unlisten = listen<RunningTaskChangedPayload>(
      OVERLAY_EVENTS.RUNNING_TASK_CHANGED,
      async ({ payload }) => {
        setRunningTask(payload.task);
        activePlannedTaskId.current = payload.plannedTaskId ?? null;
        if (payload.task) {
          await restoreOverlayPosition("overlayPosition_execution", config, { width: 220, height: 40 });
          if (config.get("overlayShowOnStart")) await appWindow.show();
        } else {
          await appWindow.hide();
          if (config.get("overlayAlwaysVisible")) {
            const planning = await WebviewWindow.getByLabel("overlay-planning");
            await planning?.show();
          }
        }
      }
    );
    return () => { unlisten.then((fn) => fn()); };
  }, [config]);

  const handlePause = useCallback(async () => {
    if (!runningTask) return;
    const updated = await pauseTaskUC(taskRepo, runningTask.id, new Date().toISOString());
    setRunningTask(updated);
    await emit(OVERLAY_EVENTS.RUNNING_TASK_CHANGED, {
      task: updated,
      source: "overlay",
    } satisfies RunningTaskChangedPayload);
  }, [runningTask]);

  const handleResume = useCallback(async () => {
    if (!runningTask) return;
    const updated = await resumeTaskUC(taskRepo, runningTask.id, new Date().toISOString());
    setRunningTask(updated);
    await emit(OVERLAY_EVENTS.RUNNING_TASK_CHANGED, {
      task: updated,
      source: "overlay",
    } satisfies RunningTaskChangedPayload);
  }, [runningTask]);

  const handleStop = useCallback(async (completed: boolean) => {
    if (!runningTask) return;
    const stoppedTask = await stopTaskUC(taskRepo, runningTask.id, new Date().toISOString());
    const plannedTaskId = activePlannedTaskId.current;
    setRunningTask(null);
    activePlannedTaskId.current = null;
    await emit(OVERLAY_EVENTS.RUNNING_TASK_CHANGED, {
      task: null,
      source: "overlay",
    } satisfies RunningTaskChangedPayload);
    await emit(OVERLAY_EVENTS.TASK_STOPPED, {
      task: stoppedTask,
      completed,
      plannedTaskId,
    } satisfies TaskStoppedPayload);
  }, [runningTask]);

  const handleCancel = useCallback(async () => {
    if (!runningTask) return;
    await cancelTaskUC(taskRepo, runningTask.id);
    activePlannedTaskId.current = null;
    setRunningTask(null);
    await emit(OVERLAY_EVENTS.RUNNING_TASK_CHANGED, {
      task: null,
      source: "overlay",
    } satisfies RunningTaskChangedPayload);
  }, [runningTask]);

  const opacity = isHovered ? 1 : overlayOpacity / 100;

  if (!runningTask) return null;

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{ opacity, transition: "opacity 0.2s ease" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ExecutionOverlayContent
        task={runningTask}
        isHovered={isHovered}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onCancel={handleCancel}
      />
    </div>
  );
}

export function ExecutionOverlayApp() {
  return (
    <ConfigProvider>
      <ExecutionOverlayAppInner />
    </ConfigProvider>
  );
}
