import type { ITaskRepository } from "@domain/repositories/ITaskRepository";

interface WeekTotal {
  totalSeconds: number;
  daysWorked: number;
}

export async function getWeekTotal(
  repo: ITaskRepository,
  weekStartDate: string,
  weekEndDate: string
): Promise<WeekTotal> {
  const tasks = await repo.findByDateRange(
    `${weekStartDate}T00:00:00.000Z`,
    `${weekEndDate}T23:59:59.999Z`
  );

  let totalSeconds = 0;
  const days = new Set<string>();
  for (const t of tasks) {
    totalSeconds += t.durationSeconds ?? 0;
    days.add(t.startTime.slice(0, 10));
  }
  return { totalSeconds, daysWorked: days.size };
}
