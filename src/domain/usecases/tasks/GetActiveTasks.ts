import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import type { Task } from "@domain/entities/Task";

export async function getActiveTasks(repo: ITaskRepository): Promise<Task[]> {
  const [running, paused] = await Promise.all([
    repo.findByStatus("running"),
    repo.findByStatus("paused"),
  ]);
  return [...running, ...paused];
}
