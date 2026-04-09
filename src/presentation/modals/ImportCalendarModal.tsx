import { useEffect, useState } from "react";
import { X, Loader2, Calendar, AlertCircle, CheckSquare, Square } from "lucide-react";
import type { CalendarEvent } from "@domain/integrations/ICalendarImporter";
import type { ICalendarImporter } from "@domain/integrations/ICalendarImporter";
import type { IPlannedTaskRepository } from "@domain/repositories/IPlannedTaskRepository";
import { importCalendarEvents } from "@domain/usecases/plannedTasks/ImportCalendarEvents";

interface ImportCalendarModalProps {
  importer: ICalendarImporter;
  repo: IPlannedTaskRepository;
  /** Início da semana em ISO (ex: "2026-04-07T00:00:00.000Z") */
  fromISO: string;
  /** Fim da semana em ISO (ex: "2026-04-13T23:59:59.999Z") */
  toISO: string;
  /** Rótulo legível da semana para exibir no modal */
  weekLabel: string;
  onImported: (count: number) => void;
  onClose: () => void;
}

function formatEventDate(event: CalendarEvent): string {
  const [year, month, day] = event.date.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekDay = date.toLocaleDateString("pt-BR", { weekday: "short" });
  const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${weekDay}. ${dateStr}`;
}

export function ImportCalendarModal({
  importer,
  repo,
  fromISO,
  toISO,
  weekLabel,
  onImported,
  onClose,
}: ImportCalendarModalProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    importer
      .getEvents(fromISO, toISO)
      .then((evts) => {
        setEvents(evts);
        // Pré-seleciona todos por padrão
        setSelected(new Set(evts.map((e) => e.id)));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao buscar eventos.");
      })
      .finally(() => setLoading(false));
  }, [fromISO, toISO]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleAll() {
    if (selected.size === events.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(events.map((e) => e.id)));
    }
  }

  function toggleEvent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleImport() {
    const toImport = events.filter((e) => selected.has(e.id));
    if (toImport.length === 0) return;
    setImporting(true);
    try {
      const count = await importCalendarEvents(repo, toImport, new Date().toISOString());
      onImported(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar eventos.");
      setImporting(false);
    }
  }

  const allSelected = events.length > 0 && selected.size === events.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 shrink-0">
          <Calendar size={16} className="text-blue-400" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-100">Importar do Google Calendar</h2>
            <p className="text-xs text-gray-500">{weekLabel}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300 rounded">
            <X size={16} />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Buscando eventos…</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2 m-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-10">
              Nenhum evento encontrado nesta semana.
            </p>
          )}

          {!loading && !error && events.length > 0 && (
            <>
              {/* Selecionar todos */}
              <div className="px-4 py-2 border-b border-gray-800">
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200"
                >
                  {allSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                  {allSelected ? "Desmarcar todos" : "Selecionar todos"}
                  <span className="text-gray-600">({events.length} eventos)</span>
                </button>
              </div>

              {/* Lista de eventos */}
              <div className="divide-y divide-gray-800">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/40"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      className="mt-0.5 accent-blue-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-100 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatEventDate(event)}
                        {event.allDay
                          ? " · Dia todo"
                          : event.startTime
                          ? ` · ${event.startTime}${event.endTime ? ` – ${event.endTime}` : ""}`
                          : ""}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && events.length > 0 && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-800 shrink-0">
            <button
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={importing || selected.size === 0}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded transition-colors"
            >
              {importing
                ? <><Loader2 size={12} className="animate-spin" />Importando…</>
                : <>Importar selecionados ({selected.size})</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
