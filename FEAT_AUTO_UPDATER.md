# FEAT_AUTO_UPDATER.md — Auto-atualização do DeskClock

> Planejamento completo da feature `feat/auto-updater`.  
> Cobre infraestrutura, backend Rust, CI/CD, frontend e UX.
>
> Legenda: `✅` concluído · `🔧` em andamento · `⬜` pendente

---

## Visão geral

O app verifica silenciosamente se há uma nova versão disponível ao abrir. Se encontrar, exibe um toast não-intrusivo. O usuário também pode verificar manualmente em Configurações → Geral. O download e a instalação ocorrem dentro do próprio app — sem abrir navegador nem acessar GitHub manualmente.

### Fluxo resumido

```
App abre
  └─ aguarda 10s (não bloqueia o startup)
       └─ check_for_update()
            ├─ sem update → silencioso
            └─ update encontrado → toast "DeskClock X.Y.Z disponível"
                                        └─ [Atualizar agora]
                                              └─ download com barra de progresso
                                                    └─ [Reiniciar]
```

---

## Pré-requisitos técnicos

### Por que precisa de assinatura

O `tauri-plugin-updater` **exige** que os artefatos sejam assinados com uma chave privada. Antes de instalar uma atualização, o plugin verifica a assinatura usando a chave pública embutida no binário — impede substituição maliciosa de executáveis.

### Endpoint de manifesto

O Tauri espera uma URL que retorne um JSON no formato:

```json
{
  "version": "0.2.0",
  "notes": "Notas da versão",
  "pub_date": "2026-04-11T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "...",
      "url": "https://github.com/.../DeskClock_0.2.0_x64-setup.nsis.zip"
    },
    "linux-x86_64": {
      "signature": "...",
      "url": "https://github.com/.../DeskClock_0.2.0_amd64.AppImage.tar.gz"
    }
  }
}
```

A `tauri-apps/tauri-action` (já usada no `release.yml`) gera e publica esse arquivo automaticamente quando configurada corretamente.

> **Windows:** o updater usa o artefato NSIS (`.exe`), não o MSI. O MSI não suporta atualizações incrementais via `tauri-plugin-updater`.

---

## Etapa 1 — Setup de infraestrutura (one-time, fora do código)

> Feito uma vez. Não vai para commit — são secrets no GitHub e um arquivo local.

### 1.1 Gerar o par de chaves de assinatura

```bash
pnpm tauri signer generate -w ~/.tauri/deskclock.key
```

Isso cria:
- `~/.tauri/deskclock.key` — chave privada (nunca commitar)
- `~/.tauri/deskclock.key.pub` — chave pública (vai para `tauri.conf.json`)

### 1.2 Adicionar secrets no GitHub

No repositório → **Settings → Secrets and variables → Actions**:

| Secret | Valor |
|--------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | conteúdo de `~/.tauri/deskclock.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | senha usada ao gerar (vazio se não usou) |

---

## Etapa 2 — Backend Rust

### 2.1 `src-tauri/Cargo.toml`

Adicionar a dependência:

```toml
tauri-plugin-updater = "2"
```

### 2.2 `src-tauri/src/lib.rs`

**Registrar o plugin** no builder (junto aos outros plugins existentes):

```rust
.plugin(tauri_plugin_updater::Builder::new().build())
```

**Adicionar dois comandos Tauri:**

```rust
#[derive(serde::Serialize)]
struct UpdateInfo {
    version: String,
    body: Option<String>,
}

/// Verifica se há atualização disponível.
/// Retorna Some(UpdateInfo) se sim, None se o app já está na versão mais recente.
#[tauri::command]
async fn check_for_update(app: tauri::AppHandle) -> Result<Option<UpdateInfo>, String> {
    use tauri_plugin_updater::UpdaterExt;
    match app.updater().map_err(|e| e.to_string())?.check().await {
        Ok(Some(update)) => Ok(Some(UpdateInfo {
            version: update.version.clone(),
            body: update.body.clone(),
        })),
        Ok(None) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

/// Baixa e instala a atualização, emitindo progresso via evento Tauri.
/// Ao terminar, o frontend pode chamar `relaunch()` para reiniciar.
#[tauri::command]
async fn download_and_install_update(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_updater::UpdaterExt;
    let update = app
        .updater()
        .map_err(|e| e.to_string())?
        .check()
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Nenhuma atualização encontrada")?;

    let app_handle = app.clone();
    update
        .download_and_install(
            |chunk, total| {
                let _ = app_handle.emit(
                    "update:progress",
                    serde_json::json!({ "chunk": chunk, "total": total }),
                );
            },
            || {
                let _ = app_handle.emit("update:ready", ());
            },
        )
        .await
        .map_err(|e| e.to_string())
}
```

**Registrar no `invoke_handler`:**

```rust
.invoke_handler(tauri::generate_handler![
    // ... handlers existentes ...
    check_for_update,
    download_and_install_update,
])
```

---

## Etapa 3 — Configuração do Tauri

### 3.1 `src-tauri/tauri.conf.json`

Adicionar a seção `updater` dentro de `"bundle"`:

```json
"bundle": {
  "active": true,
  "targets": "all",
  "icon": [...],
  "updater": {
    "active": true,
    "endpoints": [
      "https://github.com/EduardoMeira/deskclock-tauri/releases/latest/download/latest.json"
    ],
    "dialog": false,
    "pubkey": "COLE_AQUI_O_CONTEÚDO_DE_deskclock.key.pub"
  }
}
```

> `"dialog": false` desabilita o diálogo nativo do Tauri — o app controla a UX completamente via frontend.

### 3.2 `src-tauri/capabilities/default.json`

Adicionar permissões do updater:

```json
"updater:allow-check",
"updater:allow-download-and-install"
```

---

## Etapa 4 — CI/CD

### 4.1 `.github/workflows/release.yml`

Passar as variáveis de assinatura para o step de build:

```yaml
- uses: tauri-apps/tauri-action@v0
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
  with:
    tagName: ${{ github.ref_name }}
    releaseName: 'DeskClock ${{ github.ref_name }}'
    updaterJsonPreferNsis: true   # Windows: usa NSIS (não MSI) para updates
    releaseBody: |
      ...
    releaseDraft: ${{ github.event.inputs.draft || 'true' }}
```

> `updaterJsonPreferNsis: true` instrui a action a usar o `.exe` NSIS no manifesto `latest.json` em vez do `.msi`, pois o `tauri-plugin-updater` suporta apenas NSIS no Windows.

---

## Etapa 5 — Frontend TypeScript

### 5.1 Hook `useUpdater` — `src/presentation/hooks/useUpdater.ts`

Encapsula toda a lógica de atualização. Expõe:

```typescript
interface UpdaterState {
  status: "idle" | "checking" | "available" | "downloading" | "ready" | "error";
  version: string | null;
  body: string | null;
  progress: number | null;   // 0–100, null quando não está baixando
  error: string | null;
}

interface UseUpdaterReturn {
  state: UpdaterState;
  check: () => Promise<void>;
  downloadAndInstall: () => Promise<void>;
  relaunch: () => Promise<void>;
}
```

**Lógica:**
- `check()` chama `invoke("check_for_update")` → atualiza `status` para `"available"` ou volta para `"idle"`.
- `downloadAndInstall()` chama `invoke("download_and_install_update")` e escuta o evento `update:progress` para calcular o percentual.
- Ao receber `update:ready`, muda `status` para `"ready"`.
- `relaunch()` chama `relaunch()` da API Tauri para reiniciar o app.

### 5.2 Verificação silenciosa ao abrir — `src/App.tsx`

```typescript
useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      const update = await invoke<UpdateInfo | null>("check_for_update");
      if (update) {
        showToast(`DeskClock ${update.version} disponível`, "update", update.version);
      }
    } catch {
      // falha silenciosa — não incomodar o usuário por problema de rede
    }
  }, 10_000); // aguarda 10s para não competir com o startup
  return () => clearTimeout(timer);
}, []);
```

### 5.3 Toast de update

O toast existente (`ToastContext`) precisa de um novo tipo `"update"` para exibir o botão de ação:

```tsx
// Em ToastOverlay ou no ShowToast
if (type === "update") {
  return (
    <div className="toast">
      <span>DeskClock {version} disponível</span>
      <button onClick={() => openSettings("geral")}>Ver</button>
    </div>
  );
}
```

> Alternativa mais simples: o toast navega diretamente para a seção de Configurações → Geral onde fica o botão de instalar.

### 5.4 UI na tela de Configurações — `SettingsPage.tsx`

Nova subseção em **Configurações → Geral**, abaixo das opções existentes:

```
┌─────────────────────────────────────────────────────┐
│ Atualizações                                        │
│                                                     │
│  Versão atual: 0.1.0                                │
│                                                     │
│  [Verificar atualizações]   ← idle                 │
│  Verificando...             ← checking              │
│  DeskClock 0.2.0 disponível                        │
│  [Baixar e instalar]        ← available             │
│  Baixando... ████████░░ 73% ← downloading           │
│  [Reiniciar agora]          ← ready                 │
│  Falha ao verificar: ...    ← error                 │
└─────────────────────────────────────────────────────┘
```

**Componente:** `UpdaterSection` dentro de `SettingsPage.tsx`.

**Barra de progresso:** usar o mesmo padrão visual de barras já presente no app (se houver), ou um `<div>` com `width: ${progress}%` em Tailwind.

---

## Etapa 6 — Atualização do README

Adicionar subseção em **Versionamento**:

```markdown
### Auto-atualização

O app verifica automaticamente por novas versões ao iniciar (com delay de 10s).
Se uma atualização estiver disponível, um toast é exibido. O download e a
instalação ocorrem dentro do app — em Configurações → Geral → Atualizações.
```

---

## Checklist de implementação

### Infraestrutura (one-time)
- [ ] Gerar par de chaves: `pnpm tauri signer generate -w ~/.tauri/deskclock.key`
- [ ] Adicionar `TAURI_SIGNING_PRIVATE_KEY` nos secrets do GitHub
- [ ] Adicionar `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` nos secrets do GitHub
- [ ] Copiar conteúdo de `deskclock.key.pub`

### Código
- [ ] `Cargo.toml` — adicionar `tauri-plugin-updater = "2"`
- [ ] `lib.rs` — registrar plugin + comandos `check_for_update` e `download_and_install_update`
- [ ] `tauri.conf.json` — seção `updater` com endpoint e pubkey
- [ ] `capabilities/default.json` — permissões `updater:allow-check` e `updater:allow-download-and-install`
- [ ] `release.yml` — passar secrets de assinatura + `updaterJsonPreferNsis: true`
- [ ] `src/presentation/hooks/useUpdater.ts` — hook com estados e ações
- [ ] `App.tsx` — verificação silenciosa com delay de 10s
- [ ] `ToastContext` / `ToastOverlay` — suporte a tipo `"update"` com botão
- [ ] `SettingsPage.tsx` — seção `UpdaterSection` com todos os estados de UI
- [ ] `README.md` — documentar auto-atualização em Versionamento

### Validação
- [ ] Build com `release.yml` gera `latest.json` na release do GitHub
- [ ] `latest.json` contém assinaturas válidas para Linux e Windows
- [ ] App instalado recebe update ao publicar versão nova
- [ ] Barra de progresso aparece durante o download
- [ ] App reinicia corretamente após instalar update
- [ ] Verificação silenciosa ao abrir não bloqueia o startup
- [ ] Falha de rede ao verificar não exibe erro para o usuário

---

## Decisões de design

| Decisão | Justificativa |
|---|---|
| `"dialog": false` no `tauri.conf.json` | Controle total da UX pelo frontend; evita diálogo nativo genérico |
| Delay de 10s no check ao abrir | Não competir com inicialização do SQLite, shortcuts e overlays |
| Falha silenciosa no check automático | Update é conforto, não bloqueio — sem rede não deve incomodar |
| NSIS em vez de MSI no Windows | `tauri-plugin-updater` não suporta MSI; NSIS é o formato correto |
| Relaunch explícito pelo usuário | Nunca reiniciar sem consentimento — o usuário pode ter uma tarefa rodando |
| Chave pública embutida no binário | Padrão do Tauri — impede substituição do `latest.json` por atacante |

---

## Branch de execução

```
feat/auto-updater
  ├─ Etapa 1: infraestrutura (fora do código — feito uma vez)
  ├─ Etapa 2: backend Rust (Cargo.toml + lib.rs)
  ├─ Etapa 3: configuração Tauri (tauri.conf.json + capabilities)
  ├─ Etapa 4: CI/CD (release.yml)
  └─ Etapa 5: frontend (hook + App.tsx + toast + SettingsPage)
```

---

*Criado em: 11/04/2026*
