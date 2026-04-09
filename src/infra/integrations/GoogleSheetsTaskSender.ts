import type { Task } from "@domain/entities/Task";
import type { ITaskSender } from "@domain/integrations/ITaskSender";
import type { Project } from "@domain/entities/Project";
import type { Category } from "@domain/entities/Category";
import type { ConfigContextValue } from "@presentation/contexts/ConfigContext";
import { GoogleTokenManager } from "./google/GoogleTokenManager";
import { formatHHMMSS } from "@shared/utils/time";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

/**
 * Implementa ITaskSender para o Google Sheets.
 * Appenda uma linha por tarefa na planilha configurada.
 *
 * Colunas (fixas):
 *   Data | Nome | Projeto | Categoria | Billable | Início | Fim | Duração
 */
export class GoogleSheetsTaskSender implements ITaskSender {
  readonly integrationName = "Google Sheets";
  private tokenManager: GoogleTokenManager;

  constructor(
    config: ConfigContextValue,
    private spreadsheetId: string,
    private projects: Project[],
    private categories: Category[],
    private sheetName = "DeskClock",
  ) {
    this.tokenManager = new GoogleTokenManager(config);
  }

  async send(tasks: Task[]): Promise<void> {
    const token = await this.tokenManager.getValidAccessToken();

    // Garante que a aba existe antes de fazer o append
    await this.ensureSheetExists(token);

    const rows = tasks.map((t) => this.taskToRow(t));
    const range = encodeURIComponent(`${this.sheetName}!A:H`);
    const url = `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? "Erro ao enviar para o Google Sheets.");
    }
  }

  private async ensureSheetExists(token: string): Promise<void> {
    // Verifica se a aba já existe
    const metaUrl = `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}?fields=sheets.properties.title`;
    const metaRes = await fetch(metaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!metaRes.ok) return; // não bloqueia o envio se não conseguir verificar

    const meta = await metaRes.json();
    const sheets: { properties: { title: string } }[] = meta.sheets ?? [];
    const exists = sheets.some((s) => s.properties.title === this.sheetName);

    if (!exists) {
      // Cria a aba e adiciona cabeçalho
      await fetch(`${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [{ addSheet: { properties: { title: this.sheetName } } }],
        }),
      });

      // Insere cabeçalho
      const headerRange = encodeURIComponent(`${this.sheetName}!A1`);
      await fetch(
        `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}/values/${headerRange}?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [["Data", "Nome", "Projeto", "Categoria", "Billable", "Início", "Fim", "Duração"]],
          }),
        },
      );
    }
  }

  private taskToRow(task: Task): string[] {
    const start = new Date(task.startTime);
    const project = this.projects.find((p) => p.id === task.projectId);
    const category = this.categories.find((c) => c.id === task.categoryId);

    const fmt2 = (n: number) => String(n).padStart(2, "0");
    const fmtDate = (d: Date) => `${fmt2(d.getDate())}/${fmt2(d.getMonth() + 1)}/${d.getFullYear()}`;
    const fmtTime = (d: Date) => `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}`;

    return [
      fmtDate(start),
      task.name ?? "(sem nome)",
      project?.name ?? "",
      category?.name ?? "",
      task.billable ? "Sim" : "Não",
      fmtTime(start),
      task.endTime ? fmtTime(new Date(task.endTime)) : "",
      task.durationSeconds != null ? formatHHMMSS(task.durationSeconds) : "",
    ];
  }
}
