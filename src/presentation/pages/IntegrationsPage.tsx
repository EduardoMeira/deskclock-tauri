import { useEffect, useState } from "react";
import { TableProperties, Calendar, CheckCircle2, Circle, LogIn, LogOut, Loader2 } from "lucide-react";
import { useAppConfig } from "@presentation/contexts/ConfigContext";
import { startGoogleOAuth } from "@infra/integrations/google/GoogleOAuth";
import { GoogleTokenManager } from "@infra/integrations/google/GoogleTokenManager";

const SHEETS_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "openid",
  "email",
];

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
];

/* ── helpers ── */

function StatusBadge({ connected, email }: { connected: boolean; email?: string }) {
  return connected ? (
    <span className="flex items-center gap-1 text-xs text-green-400">
      <CheckCircle2 size={12} />
      {email ? `Conectado como ${email}` : "Conectado"}
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Circle size={12} />
      Não configurado
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-700"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function IntegrationCard({
  icon, title, description, connected, email, children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  connected: boolean;
  email?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-800">
        <div className="mt-0.5 text-gray-400">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
            <StatusBadge connected={connected} email={email} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

/* ── Google Sheets ── */

function GoogleSheetsIntegration() {
  const config = useAppConfig();
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [autoSync, setAutoSync] = useState(false);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.isLoaded) return;
    setSpreadsheetId(config.get("integrationGoogleSheetsSpreadsheetId"));
    setAutoSync(config.get("integrationGoogleSheetsAutoSync"));
    setConnected(!!config.get("googleRefreshToken"));
    setEmail(config.get("googleUserEmail"));
  }, [config.isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSpreadsheetIdBlur() {
    await config.set("integrationGoogleSheetsSpreadsheetId", spreadsheetId.trim());
  }

  async function handleAutoSync(value: boolean) {
    setAutoSync(value);
    await config.set("integrationGoogleSheetsAutoSync", value);
  }

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const tokens = await startGoogleOAuth(SHEETS_SCOPES);
      const manager = new GoogleTokenManager(config);
      await manager.saveTokens(tokens);
      setConnected(true);
      setEmail(tokens.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar com o Google.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    const manager = new GoogleTokenManager(config);
    await manager.clearTokens();
    setConnected(false);
    setEmail("");
  }

  return (
    <IntegrationCard
      icon={<TableProperties size={20} />}
      title="Google Sheets"
      description="Envie tarefas registradas para uma planilha no Google."
      connected={connected}
      email={email}
    >
      <Row label="ID da planilha">
        <input
          type="text"
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
          onBlur={handleSpreadsheetIdBlur}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
          className="w-72 bg-gray-800 border border-gray-700 rounded px-2.5 py-1 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
      </Row>
      <Row label="Sincronizar automaticamente ao concluir tarefa">
        <Toggle checked={autoSync} onChange={handleAutoSync} />
      </Row>
      <Row label="Autorização Google">
        {error && <span className="text-xs text-red-400 mr-2">{error}</span>}
        {connected ? (
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors"
          >
            <LogOut size={12} />
            Desconectar
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded transition-colors"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <LogIn size={12} />}
            {loading ? "Aguardando autorização…" : "Conectar com Google"}
          </button>
        )}
      </Row>
    </IntegrationCard>
  );
}

/* ── Google Calendar ── */

function GoogleCalendarIntegration() {
  const config = useAppConfig();
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.isLoaded) return;
    // Calendar usará os mesmos tokens do Google (mesmo account)
    // Para simplificar, verifica se já há autenticação ativa
    setConnected(!!config.get("googleRefreshToken"));
    setEmail(config.get("googleUserEmail"));
  }, [config.isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const tokens = await startGoogleOAuth(CALENDAR_SCOPES);
      const manager = new GoogleTokenManager(config);
      await manager.saveTokens(tokens);
      setConnected(true);
      setEmail(tokens.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar com o Google.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    const manager = new GoogleTokenManager(config);
    await manager.clearTokens();
    setConnected(false);
    setEmail("");
  }

  return (
    <IntegrationCard
      icon={<Calendar size={20} />}
      title="Google Calendar"
      description="Importe eventos do Google Calendar como tarefas planejadas."
      connected={connected}
      email={email}
    >
      <Row label="Autorização Google">
        {error && <span className="text-xs text-red-400 mr-2">{error}</span>}
        {connected ? (
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors"
          >
            <LogOut size={12} />
            Desconectar
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded transition-colors"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <LogIn size={12} />}
            {loading ? "Aguardando autorização…" : "Conectar com Google"}
          </button>
        )}
      </Row>
      {connected && (
        <Row label="Importar eventos">
          <span className="text-xs text-gray-500 italic">
            Disponível na tela de Planejamento (em breve)
          </span>
        </Row>
      )}
    </IntegrationCard>
  );
}

/* ── Page ── */

export function IntegrationsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-100">Integrações</h1>
        <p className="text-xs text-gray-500 mt-1">
          Conecte o DeskClock a ferramentas externas para exportar e importar dados automaticamente.
        </p>
      </div>

      <div className="space-y-4">
        <GoogleSheetsIntegration />
        <GoogleCalendarIntegration />
      </div>
    </div>
  );
}
