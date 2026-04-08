import type { ITaskRepository } from "@domain/repositories/ITaskRepository";

export async function deleteTask(repo: ITaskRepository, id: string): Promise<void> {
  await repo.delete(id);
}
