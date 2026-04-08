import type { ITaskRepository } from "@domain/repositories/ITaskRepository";

export async function cancelTask(repo: ITaskRepository, id: string): Promise<void> {
  await repo.delete(id);
}
