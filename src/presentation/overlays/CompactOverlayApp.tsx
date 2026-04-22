import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { emit, listen } from "@tauri-apps/api/event";
import { TaskRepository } from "@infra/database/TaskRepository";
import { startTask as startTaskUC } from "@domain/usecases/tasks/StartTask";
import { ConfigProvider, useAppConfig } from "@presentation/contexts/ConfigContext";
import {
  OVERLAY_EVENTS,
  type RunningTaskChangedPayload,
  type OverlayConfigChangedPayload,
} from "@shared/types/overlayEvents";
import { applyFontSize } from "@shared/utils/fontSize";
import { applyTheme } from "@shared/utils/theme";
import type { Theme } from "@shared/utils/theme";
import { CompactOverlayContent } from "./CompactOverlayContent";
import { useOverlayDrag, restoreOverlayPosition } from "./useOverlayDrag";

const taskRepo = new TaskRepository();
const appWindow = getCurrentWindow();

function CompactOverlayAppInner() {
  const config = useAppConfig();
  const [isHovered, setIsHovered] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  const [snapToGrid, setSnapToGrid] = useState(false);

  useOverlayDrag("overlayPosition_compact", snapToGrid, config);

  useEffect(() => {
    if (!config.isLoaded) return;
    applyFontSize(config.get("fontSize"));
    applyTheme(config.get("theme") as Theme);
    setOverlayOpacity(config.get("overlayOpacity") as number);
    setSnapToGrid(!!config.get("overlaySnapToGrid"));
    // Trava tamanho via min/max: resizable:true é obrigatório no GTK,
    // mas min=max=alvo impede redimensionamento manual.
    void appWindow.setMinSize(new LogicalSize(52, 52));
    void appWindow.setMaxSize(new LogicalSize(52, 52));
    void restoreOverlayPosition("overlayPosition_compact", config, { width: 52, height: 52 });
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

  // Hide when a task starts; show when task stops (if overlayAlwaysVisible is off — planning handles the on case)
  useEffect(() => {
    const unlisten = listen<RunningTaskChangedPayload>(
      OVERLAY_EVENTS.RUNNING_TASK_CHANGED,
      ({ payload }) => {
        if (payload.task) void appWindow.hide();
      }
    );
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  const handleExpand = useCallback(async () => {
    const planning = await WebviewWindow.getByLabel("overlay-planning");
    await planning?.show();
    await appWindow.hide();
  }, []);

  const handleStartTask = useCallback(async (input: {
    name?: string | null;
    projectId?: string | null;
    categoryId?: string | null;
    billable: boolean;
  }) => {
    const task = await startTaskUC(taskRepo, input, new Date().toISOString());
    await emit(OVERLAY_EVENTS.RUNNING_TASK_CHANGED, {
      task,
      source: "overlay",
      plannedTaskId: null,
    } satisfies RunningTaskChangedPayload);
  }, []);

  const opacity = isHovered ? 1 : overlayOpacity / 100;

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{ opacity, transition: "opacity 0.2s ease" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CompactOverlayContent onExpand={handleExpand} onStartTask={handleStartTask} />
    </div>
  );
}

export function CompactOverlayApp() {
  return (
    <ConfigProvider>
      <CompactOverlayAppInner />
    </ConfigProvider>
  );
}
