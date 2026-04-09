import { useEffect, useState } from "react";
import { TableProperties, Calendar, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { useAppConfig } from "@presentation/contexts/ConfigContext";

/* ── helpers ── */

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <span className="flex items-center gap-1 text-xs text-green-400">
      <CheckCircle2 size={12} />
      Conectado
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Circle size={12} />
      Não configurado
    </span>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
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
  icon,
  title,
  description,
  connected,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  connected: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-800">
        <div className="mt-0.5 text-gray-400">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
            <StatusBadge connected={connected} />
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

  useEffect(() => {
    if (!config.isLoaded) return;
    setSpreadsheetId(config.get("integrationGoogleSheetsSpreadsheetId"));
    setAutoSync(config.get("integrationGoogleSheetsAutoSync"));
  }, [config.isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSpreadsheetIdBlur() {
    await config.set("integrationGoogleSheetsSpreadsheetId", spreadsheetId.trim());
  }

  async function handleAutoSync(value: boolean) {
    setAutoSync(value);
    await config.set("integrationGoogleSheetsAutoSync", value);
  }

  const isConfigured = spreadsheetId.trim().length > 0;

  return (
    <IntegrationCard
      icon={<TableProperties size={20} />}
      title="Google Sheets"
      description="Envie tarefas registradas para uma planilha no Google."
      connected={isConfigured}
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
        <span className="text-xs text-gray-600 italic">Em breve</span>
        <button
          disabled
          title="OAuth com Google — em breve"
          className="flex items-center gap-1.5 text-xs bg-gray-800 text-gray-500 px-3 py-1.5 rounded cursor-not-allowed"
        >
          <ExternalLink size={12} />
          Conectar com Google
        </button>
      </Row>
    </IntegrationCard>
  );
}

/* ── Google Calendar ── */

function GoogleCalendarIntegration() {
  return (
    <IntegrationCard
      icon={<Calendar size={20} />}
      title="Google Calendar"
      description="Importe eventos do Google Calendar como tarefas planejadas."
      connected={false}
    >
      <Row label="Autorização Google">
        <span className="text-xs text-gray-600 italic">Em breve</span>
        <button
          disabled
          title="OAuth com Google — em breve"
          className="flex items-center gap-1.5 text-xs bg-gray-800 text-gray-500 px-3 py-1.5 rounded cursor-not-allowed"
        >
          <ExternalLink size={12} />
          Conectar com Google
        </button>
      </Row>
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
