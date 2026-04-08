import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { ConfigProvider, useAppConfig } from "@presentation/contexts/ConfigContext";
import { RunningTaskProvider, useRunningTask } from "@presentation/contexts/RunningTaskContext";
import { Sidebar, type Page } from "@presentation/components/Sidebar";
import { WelcomeOverlay } from "@presentation/overlays/WelcomeOverlay";
import { TasksPage } from "@presentation/pages/TasksPage";
import { PlanningPage } from "@presentation/pages/PlanningPage";
import { HistoryPage } from "@presentation/pages/HistoryPage";
import { DataPage } from "@presentation/pages/DataPage";
import { SettingsPage } from "@presentation/pages/SettingsPage";
import { OVERLAY_EVENTS } from "@shared/types/overlayEvents";

function PageContent({ page }: { page: Page }) {
  switch (page) {
    case "tasks":    return <TasksPage />;
    case "planning": return <PlanningPage />;
    case "data":     return <DataPage />;
    case "history":  return <HistoryPage />;
    case "settings": return <SettingsPage />;
  }
}

async function getOverlay() {
  return WebviewWindow.getByLabel("overlay");
}

// Componente interno — tem acesso a config E a useRunningTask
function MainContent({
  page,
  setPage,
  showWelcome,
  setShowWelcome,
}: {
  page: Page;
  setPage: (p: Page) => void;
  showWelcome: boolean;
  setShowWelcome: (v: boolean) => void;
}) {
  const { startTask } = useRunningTask();
  const config = useAppConfig();

  async function handleWelcomeNewTask() {
    setShowWelcome(false);
    await startTask({ billable: true });
  }

  return (
    <>
      <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
        <Sidebar current={page} onChange={setPage} />
        <main className="flex-1 ml-14 overflow-hidden">
          <PageContent page={page} />
        </main>
      </div>

      {showWelcome && (
        <WelcomeOverlay
          userName={config.get("userName")}
          onNavigatePlanning={() => { setShowWelcome(false); setPage("planning"); }}
          onNewTask={handleWelcomeNewTask}
        />
      )}
    </>
  );
}

function AppInner() {
  const config = useAppConfig();
  const [page, setPage] = useState<Page>("tasks");
  const [showWelcome, setShowWelcome] = useState(false);

  // Decide se mostra WelcomeOverlay ou overlay window ao iniciar
  useEffect(() => {
    if (!config.isLoaded) return;
    if (config.get("showWelcomeMessage")) {
      setShowWelcome(true);
    } else if (config.get("overlayAlwaysVisible")) {
      getOverlay().then((overlay) => overlay?.show());
    }
  }, [config.isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ouve evento de navegação vindo do overlay (botão "Ir para planejamento")
  useEffect(() => {
    const unlisten = listen(OVERLAY_EVENTS.OVERLAY_NAVIGATE_PLANNING, () => {
      setPage("planning");
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  return (
    <RunningTaskProvider config={config}>
      <MainContent
        page={page}
        setPage={setPage}
        showWelcome={showWelcome}
        setShowWelcome={setShowWelcome}
      />
    </RunningTaskProvider>
  );
}

function App() {
  return (
    <ConfigProvider>
      <AppInner />
    </ConfigProvider>
  );
}

export default App;
