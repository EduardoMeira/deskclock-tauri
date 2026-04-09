# Pendências — DeskClock

> Gerado em 09/04/2026. Atualizar este arquivo a cada sessão de desenvolvimento.

---

## Estado atual

Todas as fases de 1 a 7 e a fase 9 (polish) estão concluídas.
A fase 8 (integrações) está parcialmente implementada.

**253 testes passando. Zero erros de TypeScript.**

---

## Pendências prioritárias

### 1. Google Sheets — auto-sync ao concluir tarefa

**O que falta:** O toggle "Sincronizar automaticamente ao concluir tarefa" existe na UI (salvo no Config como `integrationGoogleSheetsAutoSync`), mas a lógica não está implementada.

**O que fazer:**
- Em `RunningTaskContext` (ou onde `stopTask` é chamado), após parar a tarefa, verificar se `integrationGoogleSheetsAutoSync === true` e `googleRefreshToken` está preenchido.
- Criar `GoogleSheetsTaskSender` e chamar `sender.send([task])` com a tarefa recém-concluída.
- Em caso de erro silencioso (não bloquear o stop da tarefa).

**Arquivos relevantes:**
- `src/presentation/contexts/RunningTaskContext.tsx` — onde `stopTask` é implementado
- `src/infra/integrations/GoogleSheetsTaskSender.ts` — sender já implementado
- `src/infra/integrations/google/GoogleTokenManager.ts` — gerencia tokens

---

### 2. Google Calendar — importação de eventos como tarefas planejadas

**O que falta:** Interface de domínio, implementação em infra, e UI na tela de Planejamento (semana).

**O que fazer:**

**2a. Domain:**
- Criar `src/domain/integrations/IPlannedTaskImporter.ts`:
  ```ts
  export interface IPlannedTaskImporter {
    readonly integrationName: string;
    import(dateStart: string, dateEnd: string): Promise<ImportedEvent[]>;
  }
  export interface ImportedEvent {
    title: string;
    date: string; // ISO date (YYYY-MM-DD)
    startTime?: string; // HH:MM
    endTime?: string;   // HH:MM
  }
  ```

**2b. Infra:**
- Criar `src/infra/integrations/GoogleCalendarImporter.ts` implementando `IPlannedTaskImporter`
- Endpoint: `GET https://www.googleapis.com/calendar/v3/calendars/primary/events`
- Parâmetros: `timeMin`, `timeMax`, `singleEvents=true`, `orderBy=startTime`
- Mapear `summary` → `title`, `start.date` ou `start.dateTime` → `date`

**2c. UI:**
- Botão "Importar Google Agenda" na tela de Planejamento (semana) — especificado em `CLAUDE.md §5.3.2`
- Ao clicar: abre modal com lista de eventos do período exibido
- Modal: checkbox por evento, botão "Importar selecionados"
- Ao confirmar: chama `createPlannedTask` para cada evento selecionado como `specific_date`

**Arquivos relevantes:**
- `src/presentation/pages/PlanningPage.tsx` — adicionar botão na view de semana
- `src/presentation/components/WeekPlanningView.tsx` — local do botão
- `src/presentation/modals/` — criar `GoogleCalendarImportModal.tsx`
- `src/domain/usecases/plannedTasks/CreatePlannedTask.ts` — use case existente para criar as tarefas

**Nota:** Google Calendar usa os mesmos tokens OAuth do Google Sheets (mesmo `googleRefreshToken`). Se o usuário conectou Sheets, Calendar também funciona. A UI da tela de Integrações já exibe status "Conectado" para Calendar quando há token.

---

### 3. Validação do fluxo OAuth no Windows

O servidor OAuth foi implementado usando `std::net::TcpListener` em Rust. O fluxo foi desenvolvido no WSL e ainda não foi testado no Windows nativo.

**O que verificar:**
- O `start_oauth_server` Tauri command retorna a porta corretamente
- O browser abre com a URL do Google
- O redirect para `http://localhost:{porta}/callback` é capturado pelo servidor Rust
- O evento `oauth_callback_received` chega ao frontend
- O token exchange funciona e os tokens são salvos no Config

**Configuração necessária no Google Cloud Console:**
- Tipo do OAuth Client: **Desktop app** (não Web application)
- Com tipo "Desktop app", o Google aceita `http://localhost` com qualquer porta automaticamente — não é necessário registrar cada porta

---

### 4. Testes da camada de integração

Os arquivos de integração (`GoogleOAuth.ts`, `GoogleTokenManager.ts`, `GoogleSheetsTaskSender.ts`, `GoogleCalendarImporter.ts`) não têm testes unitários — eles dependem de fetch e do runtime Tauri.

**O que fazer (opcional, mas recomendado):**
- Criar mocks para `fetch` e `invoke` do Tauri
- Testar `GoogleTokenManager`: `isConnected()`, `getValidAccessToken()` com token expirado, `clearTokens()`
- Testar `GoogleSheetsTaskSender`: mapeamento `taskToRow()`, construção correta da URL da API
- Testar `GoogleCalendarImporter`: mapeamento de eventos para `ImportedEvent`

---

## Backlog (fora do escopo atual, para versões futuras)

| Item | Contexto |
|---|---|
| Armazenamento seguro de tokens | Substituir Config (SQLite) por `tauri-plugin-stronghold` para tokens OAuth |
| Suporte a múltiplas contas Google | Atualmente um único par de tokens para Sheets + Calendar |
| Novas integrações | A interface `ITaskSender` está pronta; basta criar implementações em `infra/integrations/` |
| Modo de envio no Histórico | Atualmente o modo de envio só existe em "Entradas de hoje"; o Histórico tem botão de exportação mas não de envio para integração |
| Configuração de colunas do Google Sheets | Hoje as colunas são fixas (Data, Nome, Projeto, Categoria, Billable, Início, Fim, Duração). Poderia ser configurável como os perfis de exportação |
| Build para macOS | O workflow de release cobre Linux e Windows. macOS exigiria assinatura com Apple Developer Account |

---

## Como retomar

```bash
# Instalar dependências
pnpm install

# Verificar que tudo está ok antes de começar
pnpm tsc --noEmit
pnpm test

# Criar branch para a próxima feature
git checkout -b feat/google-calendar-import
# ou
git checkout -b feat/sheets-autosync
```

**Ordem sugerida:**
1. Validar OAuth no Windows (sem código novo — só teste)
2. Auto-sync Google Sheets (pequeno, alto impacto)
3. Google Calendar importação (maior, completa a fase 8)
