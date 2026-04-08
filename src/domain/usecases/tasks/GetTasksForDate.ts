import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import type { Task } from "@domain/entities/Task";

export async function getTasksForDate(
  repo: ITaskRepository,
  dateISO: string
): Promise<Task[]> {
  return repo.findByDateRange(
    `${dateISO}T00:00:00.000Z`,
    `${dateISO}T23:59:59.999Z`
  );
}
