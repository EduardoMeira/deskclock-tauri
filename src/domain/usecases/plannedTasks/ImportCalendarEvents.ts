import type { IPlannedTaskRepository } from "@domain/repositories/IPlannedTaskRepository";
import type { CalendarEvent } from "@domain/integrations/ICalendarImporter";
import { createPlannedTask } from "./CreatePlannedTask";

/**
 * Cria PlannedTasks a partir de eventos selecionados do Google Calendar.
 * Cada evento vira uma tarefa do tipo "specific_date" com o nome e a data do evento.
 * Retorna o número de tarefas criadas.
 */
export async function importCalendarEvents(
  repo: IPlannedTaskRepository,
  events: CalendarEvent[],
  nowISO: string,
): Promise<number> {
  if (events.length === 0) return 0;

  for (const event of events) {
    await createPlannedTask(repo, {
      name: event.title,
      billable: false,
      scheduleType: "specific_date",
      scheduleDate: event.date,
    }, nowISO);
  }

  return events.length;
}
