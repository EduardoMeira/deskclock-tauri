export function formatHHMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

export function formatDurationCompact(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}m`;
  return `${m}m`;
}

export function formatWeekTotal(totalSeconds: number, days: number): string {
  return `${formatHHMMSS(totalSeconds)} ${days}d`;
}

export function formatTimeOfDay(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekBoundsISO(): { start: string; end: string } {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const diffToMon = (dow === 0 ? -6 : 1 - dow);
  const mon = new Date(today);
  mon.setDate(today.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  };
  return { start: fmt(mon), end: fmt(sun) };
}

export function parseDurationInput(input: string): number | null {
  const trimmed = input.trim();
  // HH:MM:SS
  const hms = trimmed.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (hms) return Number(hms[1]) * 3600 + Number(hms[2]) * 60 + Number(hms[3]);
  // MM:SS
  const ms = trimmed.match(/^(\d+):(\d{2})$/);
  if (ms) return Number(ms[1]) * 60 + Number(ms[2]);
  // inteiro = minutos
  const mins = trimmed.match(/^\d+$/);
  if (mins) return Number(mins[0]) * 60;
  return null;
}
