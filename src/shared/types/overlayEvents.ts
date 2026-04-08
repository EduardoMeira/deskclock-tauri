import type { Task } from "@domain/entities/Task";

export const OVERLAY_EVENTS = {
  RUNNING_TASK_CHANGED: "running-task-changed",
  OVERLAY_NAVIGATE_PLANNING: "overlay-navigate-planning",
} as const;

export interface RunningTaskChangedPayload {
  task: Task | null;
  source: string;
}
