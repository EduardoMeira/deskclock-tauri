import type { Task } from "@domain/entities/Task";

export function differenceInSeconds(laterISO: string, earlierISO: string): number {
  return Math.floor((new Date(laterISO).getTime() - new Date(earlierISO).getTime()) / 1000);
}

export function effectiveDuration(task: Task, nowISO: string): number {
  const accumulated = task.durationSeconds ?? 0;
  if (task.status !== "running") return accumulated;
  const elapsed = differenceInSeconds(nowISO, task.startTime);
  return accumulated + Math.max(0, elapsed);
}
