import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import type { Task } from "@domain/entities/Task";
import { DomainError } from "@shared/errors";
import { differenceInSeconds } from "./_helpers";

export async function pauseTask(repo: ITaskRepository, id: string, nowISO: string): Promise<Task> {
  const task = await repo.findById(id);
  if (!task) throw new DomainError(`Task ${id} not found`);
  if (task.status !== "running") throw new DomainError(`Task ${id} is not running`);

  const elapsed = differenceInSeconds(nowISO, task.startTime);
  const updated: Task = {
    ...task,
    status: "paused",
    durationSeconds: (task.durationSeconds ?? 0) + Math.max(0, elapsed),
    startTime: nowISO,
    updatedAt: nowISO,
  };
  await repo.update(updated);
  return updated;
}
