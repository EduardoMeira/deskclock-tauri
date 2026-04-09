import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { getTasksForDate } from "./GetTasksForDate";

interface TodayTotals {
  billableSeconds: number;
  nonBillableSeconds: number;
}

export async function getTodayTotals(repo: ITaskRepository, dateISO: string): Promise<TodayTotals> {
  const tasks = await getTasksForDate(repo, dateISO);
  let billableSeconds = 0;
  let nonBillableSeconds = 0;
  for (const t of tasks) {
    const secs = t.durationSeconds ?? 0;
    if (t.billable) billableSeconds += secs;
    else nonBillableSeconds += secs;
  }
  return { billableSeconds, nonBillableSeconds };
}
