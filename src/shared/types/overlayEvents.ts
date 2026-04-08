import type { Task } from "@domain/entities/Task";

export const OVERLAY_EVENTS = {
  RUNNING_TASK_CHANGED: "running-task-changed",
  OVERLAY_NAVIGATE_PLANNING: "overlay-navigate-planning",
  WELCOME_CLOSED: "welcome-closed",
  OVERLAY_SET_MODE: "overlay-set-mode",
  OVERLAY_CONFIG_CHANGED: "overlay-config-changed",
} as const;

export interface RunningTaskChangedPayload {
  task: Task | null;
  source: string;
}

export interface WelcomeClosedPayload {
  action: "navigate-planning" | "start-task" | "close";
}

export interface OverlaySetModePayload {
  mode: "execution" | "planning" | "compact";
}

export interface OverlayConfigChangedPayload {
  key: string;
  value: unknown;
}
