import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import type { Task } from "@domain/entities/Task";
import { DomainError } from "@shared/errors";
import { effectiveDuration } from "./_helpers";

export async function resumeTask(repo: ITaskRepository, id: string, nowISO: string): Promise<Task> {
  const task = await repo.findById(id);
  if (!task) throw new DomainError(`Task ${id} not found`);
  if (task.status !== "paused") throw new DomainError(`Task ${id} is not paused`);

  const running = await repo.findByStatus("running");
  await Promise.all(
    running.map((t) =>
      repo.update({
        ...t,
        status: "completed",
        endTime: nowISO,
        durationSeconds: effectiveDuration(t, nowISO),
        updatedAt: nowISO,
      })
    )
  );

  const updated: Task = {
    ...task,
    status: "running",
    startTime: nowISO,
    updatedAt: nowISO,
  };
  await repo.update(updated);
  return updated;
}
