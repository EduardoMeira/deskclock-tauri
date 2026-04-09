import type { Task } from "@domain/entities/Task";

/**
 * Interface para envio de tarefas a integrações externas.
 * Implementações concretas ficam em infra/integrations/.
 * Novas integrações (Google Sheets, Jira, API própria…) basta
 * implementar esta interface sem alterar nada no domain ou na UI.
 */
export interface ITaskSender {
  /** Nome legível da integração (ex: "Google Sheets") */
  readonly integrationName: string;
  /** Envia as tarefas para a integração externa */
  send(tasks: Task[]): Promise<void>;
}
