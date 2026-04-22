import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { emit, listen } from "@tauri-apps/api/event";
import { LogicalSize } from "@tauri-apps/api/dpi";
import type { Task } from "@domain/entities/Task";
import { TaskRepository } from "@infra/database/TaskRepository";
import { startTask as startTaskUC } from "@domain/usecases/tasks/StartTask";
import { ConfigProvider, useAppConfig } from "@presentation/contexts/ConfigContext";
import {
  OVERLAY_EVENTS,
  type RunningTaskChangedPayload,
  type OverlayConfigChangedPayload,
} from "@shared/types/overlayEvents";
import { executeActions } from "@shared/utils/actions";
import { openInBrowser, openInFileManager } from "@shared/utils/shell";
import { applyFontSize } from "@shared/utils/fontSize";
import { applyTheme } from "@shared/utils/theme";
import type { Theme } from "@shared/utils/theme";
import { PlanningOverlayContent } from "./PlanningOverlayContent";
import { useOverlayDrag, restoreOverlayPosition } from "./useOverlayDrag";
import type { PlannedTask } from "@domain/entities/PlannedTask";

const taskRepo = new TaskRepository();
const appWindow = getCurrentWindow();

const FALLBACK_SIZE = { width: 288, height: 142 };

function PlanningOverlayAppInner() {
  const config = useAppConfig();
  const [runningTask, setRunningTask] = useState<Task | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const intendedSizeRef = useRef(FALLBACK_SIZE);
  const isProgrammaticResizeRef = useRef(false);
  const isStartingTaskRef = useRef(false);

  useOverlayDrag("overlayPosition_planning", snapToGrid, config);

  // Centraliza setSize: limpa constraints → resize → trava via min/max.
  // Necessário porque resizable:true (GTK exige) permite resize manual.
  const programmaticSetSize = useCallback(async (width: number, height: number) => {
    intendedSizeRef.current = { width, height };
    isProgrammaticResizeRef.current = true;
    await appWindow.setMinSize(null);
    await appWindow.setMaxSize(null);
    await appWindow.setSize(new LogicalSize(width, height));
    await appWindow.setMinSize(new LogicalSize(width, height));
    await appWindow.setMaxSize(new LogicalSize(width, height));
    setTimeout(() => { isProgrammaticResizeRef.current = false; }, 80);
  }, []);

  // Trava resize manual do usuário
  useEffect(() => {
    const unlisten = appWindow.listen("tauri://resize", () => {
      if (isProgrammaticResizeRef.current) return;
      const { width, height } = intendedSizeRef.current;
      void programmaticSetSize(width, height);
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [programmaticSetSize]);

  useEffect(() => {
    if (!config.isLoaded) return;
    applyFontSize(config.get("fontSize"));
    applyTheme(config.get("theme") as Theme);
    setOverlayOpacity(config.get("overlayOpacity") as number);
    setSnapToGrid(!!config.get("overlaySnapToGrid"));
    void restoreOverlayPosition("overlayPosition_planning", config, FALLBACK_SIZE);
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

  // Hide when task starts; show when task stops (if overlayAlwaysVisible)
  useEffect(() => {
    const unlisten = listen<RunningTaskChangedPayload>(
      OVERLAY_EVENTS.RUNNING_TASK_CHANGED,
      ({ payload }) => {
        setRunningTask(payload.task);
        if (payload.task) void appWindow.hide();
      }
    );
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  const handleStartTask = useCallback(async (input: {
    name?: string | null;
    projectId?: string | null;
    categoryId?: string | null;
    billable: boolean;
    plannedTaskId?: string | null;
  }) => {
    if (isStartingTaskRef.current) return;
    isStartingTaskRef.current = true;
    try {
      const task = await startTaskUC(taskRepo, input, new Date().toISOString());
      await emit(OVERLAY_EVENTS.RUNNING_TASK_CHANGED, {
        task,
        source: "overlay",
        plannedTaskId: input.plannedTaskId ?? null,
      } satisfies RunningTaskChangedPayload);
    } finally {
      isStartingTaskRef.current = false;
    }
  }, []);

  const handlePlay = useCallback(async (task: PlannedTask) => {
    if (runningTask) return;
    await executeActions(task.actions, { openUrl: openInBrowser, openPath: openInFileManager });
    await handleStartTask({
      name: task.name,
      projectId: task.projectId,
      categoryId: task.categoryId,
      billable: task.billable,
      plannedTaskId: task.id,
    });
  }, [runningTask, handleStartTask]);

  const handleMinimize = useCallback(async () => {
    const compact = await WebviewWindow.getByLabel("overlay-compact");
    await compact?.show();
    await appWindow.hide();
  }, []);

  const handleNavigatePlanning = useCallback(async () => {
    await emit(OVERLAY_EVENTS.OVERLAY_NAVIGATE_PLANNING, {});
  }, []);

  const opacity = isHovered ? 1 : overlayOpacity / 100;

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{ opacity, transition: "opacity 0.2s ease" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <PlanningOverlayContent
        onMinimize={handleMinimize}
        onClose={() => appWindow.hide()}
        onNavigatePlanning={handleNavigatePlanning}
        onResize={programmaticSetSize}
        onStartTask={handleStartTask}
        onPlay={handlePlay}
        runningTask={runningTask}
      />
    </div>
  );
}

export function PlanningOverlayApp() {
  return (
    <ConfigProvider>
      <PlanningOverlayAppInner />
    </ConfigProvider>
  );
}
