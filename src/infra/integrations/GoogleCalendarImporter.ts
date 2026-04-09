import type { ICalendarImporter, CalendarEvent } from "@domain/integrations/ICalendarImporter";
import type { ConfigContextValue } from "@presentation/contexts/ConfigContext";
import { GoogleTokenManager } from "./google/GoogleTokenManager";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

interface GoogleEventDateTime {
  dateTime?: string; // ISO 8601 com fuso — presente em eventos com horário
  date?: string;     // "YYYY-MM-DD" — presente em eventos de dia inteiro
  timeZone?: string;
}

interface GoogleEvent {
  id: string;
  summary?: string;
  start: GoogleEventDateTime;
  end: GoogleEventDateTime;
  status?: string;
}

interface GoogleEventsResponse {
  items?: GoogleEvent[];
  error?: { message: string };
}

export class GoogleCalendarImporter implements ICalendarImporter {
  private tokenManager: GoogleTokenManager;

  constructor(config: ConfigContextValue) {
    this.tokenManager = new GoogleTokenManager(config);
  }

  async getEvents(fromISO: string, toISO: string): Promise<CalendarEvent[]> {
    const token = await this.tokenManager.getValidAccessToken();

    const params = new URLSearchParams({
      timeMin: fromISO,
      timeMax: toISO,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
    });

    const res = await fetch(`${CALENDAR_API}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const body: GoogleEventsResponse = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        body?.error?.message ?? `Erro HTTP ${res.status} ao buscar eventos do Google Calendar.`,
      );
    }

    return (body.items ?? [])
      .filter((e) => e.status !== "cancelled" && (e.summary ?? "").trim() !== "")
      .map((e) => this.mapEvent(e));
  }

  private mapEvent(event: GoogleEvent): CalendarEvent {
    const allDay = !event.start.dateTime;

    if (allDay) {
      // Eventos de dia inteiro têm apenas "date" (YYYY-MM-DD)
      return {
        id: event.id,
        title: event.summary ?? "(sem título)",
        date: event.start.date!,
        allDay: true,
      };
    }

    // Eventos com horário: extrai data e hora locais do ISO com fuso
    const startDate = new Date(event.start.dateTime!);
    const endDate = new Date(event.end.dateTime!);

    const fmt2 = (n: number) => String(n).padStart(2, "0");
    const toDateStr = (d: Date) =>
      `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;
    const toTimeStr = (d: Date) => `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}`;

    return {
      id: event.id,
      title: event.summary ?? "(sem título)",
      date: toDateStr(startDate),
      startTime: toTimeStr(startDate),
      endTime: toTimeStr(endDate),
      allDay: false,
    };
  }
}
