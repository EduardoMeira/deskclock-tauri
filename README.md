# DeskClock

Aplicativo desktop de registro de horas trabalhadas, construído com Tauri + React + TypeScript. Adaptável ao modo de trabalho de cada pessoa — não o contrário.

## Funcionalidades

### Registro de tarefas
- Timer ao vivo com play, pausa e stop
- Edição de hora de início com recalculo automático do timer
- Cancelamento imediato de tarefa sem confirmação
- Inicia nova tarefa automaticamente parando a tarefa atual
- Totalizadores diários e semanais (billable / non-billable)

### Lançamento retroativo
- Tela dedicada para registro de tarefas passadas em sequência
- Modos: hora início + hora fim, ou hora início + duração
- Cadeia de horários: o início da próxima tarefa é preenchido automaticamente com o fim da anterior
- Detecção de tarefas que cruzam meia-noite (overnight)
- Navegação de data com DatePicker

### Planejamento
- **Hoje:** formulário inline com Nome, Projeto, Categoria e Ações automáticas
- **Semana:** navegação por semana, filtros por dia, tipos `specific_date` / `recurring` / `period`
- Tarefas recorrentes sem data de término
- Concluir/Pendente por dia (sem excluir a tarefa)
- Ações por tarefa: abrir URL ou arquivo ao iniciar

### Histórico
- Filtros rápidos: Hoje, 7 dias, 30 dias, Este mês
- Filtros avançados: período, nome, projeto, categoria, billable
- Agrupamento por dia no fuso local do usuário
- Totalizadores: total, billable, non-billable, qtd registros
- Edição e exclusão por tarefa

### Exportação
- Perfis de exportação reutilizáveis (CRUD)
- Formatos: CSV, XLSX, JSON
- Separador CSV configurável (vírgula ou ponto-e-vírgula)
- Formato de duração: HH:MM:SS, decimal, minutos
- Formato de data: ISO ou DD/MM/AAAA
- Colunas reordenáveis com toggle de visibilidade
- Destino: salvar arquivo, copiar para área de transferência

### Projetos e Categorias
- Importação em massa (um por linha)
- Adição individual + exclusão sem confirmação
- Prefixo `!` para marcar categoria como non-billable na importação

### Overlays
- **Execution Overlay:** janela flutuante com timer ao vivo, arrastável, persistência de posição
- **Planning Overlay:** lista de tarefas planejadas para hoje, minimizável
- **Compact Overlay:** ícone + badge com contador de tarefas pendentes
- **Welcome Overlay:** saudação por hora do dia ao abrir o app
- Opacidade em repouso configurável, snap-to-grid opcional

### Configurações
- Autostart na inicialização do sistema operacional
- Timer ao vivo no ícone da bandeja (system tray)
- Atalhos globais configuráveis: toggle tarefa, parar, mostrar/ocultar overlay e janela
- Temas: Azul, Verde, Escuro, Claro
- Tamanho de fonte: P, M, G, GG
- Saudação personalizada no Welcome Overlay

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Framework desktop | Tauri v2 |
| Frontend | React 18 + TypeScript |
| Estilização | Tailwind CSS v4 |
| Ícones | Lucide React |
| Banco de dados | SQLite (`tauri-plugin-sql`) |
| Arquitetura | Clean Architecture |
| Testes | Vitest |
| Links externos | `tauri-plugin-opener` |
| Atalhos globais | `tauri-plugin-global-shortcut` |
| Autostart | `tauri-plugin-autostart` |

---

## Setup local

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://rustup.rs/) (stable, mínimo 1.77.2)
- Dependências do sistema para o seu SO (ver seção abaixo)

#### Dependências do sistema — Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  librsvg2-dev \
  patchelf \
  libxdo-dev \
  libayatana-appindicator3-dev
```

#### Dependências do sistema — Windows

Nenhuma instalação adicional necessária. O Tauri utiliza o WebView2, que já vem integrado no Windows 10 (atualização 1803+) e Windows 11.

### Instalação

```bash
git clone <repo>
cd deskclock-tauri
pnpm install
```

### Desenvolvimento

```bash
# Frontend apenas (Vite dev server, sem janela nativa)
pnpm dev

# App Tauri completo com hot reload
pnpm tauri dev
```

### Testes

```bash
# Execução única
pnpm test

# Watch mode
pnpm test:watch

# Cobertura
pnpm test:coverage
```

### Linting e formatação

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
```

---

## Build local

```bash
# 1. Verifica tipos TypeScript
pnpm tsc --noEmit

# 2. Roda os testes
pnpm test

# 3. Gera o instalador nativo para o SO atual
pnpm tauri build
```

Os artefatos são gerados em `src-tauri/target/release/bundle/`:

| SO | Pasta | Formatos |
|---|---|---|
| Windows | `bundle/msi/` e `bundle/nsis/` | `.msi`, `.exe` |
| Ubuntu / Debian | `bundle/deb/` | `.deb` |
| Linux (universal) | `bundle/appimage/` | `.AppImage` |

---

## CI/CD — Integração e Entrega Contínua

O projeto possui dois workflows no GitHub Actions, localizados em `.github/workflows/`.

### `ci.yml` — Integração Contínua

Roda automaticamente em todo **push para `main`** e em todo **pull request** aberto contra `main`.

**O que executa:**
1. `pnpm tsc --noEmit` — verifica tipos TypeScript sem gerar artefatos
2. `pnpm test` — roda os 245+ testes unitários com Vitest
3. `pnpm lint` — valida o código com ESLint

Um PR só deve ser mergeado se todos esses passos passarem.

### `release.yml` — Release Multiplataforma

Gera instaladores nativos e publica uma release no GitHub. Pode ser ativado de duas formas:

#### 1. Via tag Git (fluxo principal)

```bash
# Certifique-se de que main está estável e os testes passam
git checkout main
git pull

# Crie e empurre a tag com o número da versão
git tag v0.1.0
git push origin v0.1.0
```

O workflow é disparado automaticamente, builda para Linux e Windows em paralelo, e cria um **rascunho de release** no GitHub com os instaladores anexados.

#### 2. Via interface do GitHub (dispatch manual)

1. Acesse **Actions → Release** no repositório
2. Clique em **Run workflow**
3. Escolha se deseja criar como rascunho ou publicar diretamente

#### O que o workflow faz

```
Para cada plataforma (ubuntu-22.04, windows-latest):
  1. Instala dependências do sistema (apenas Linux)
  2. Configura pnpm, Node 20 e Rust stable
  3. Restaura cache do Cargo (acelera rebuilds)
  4. pnpm install
  5. pnpm tsc --noEmit    ← falha rápido se houver erro de tipo
  6. pnpm test            ← falha rápido se algum teste quebrar
  7. pnpm tauri build     ← gera o instalador
  8. Publica no GitHub Releases
```

#### Artefatos produzidos por release

| Plataforma | Arquivo | Uso |
|---|---|---|
| Linux | `DeskClock_x.y.z_amd64.deb` | Ubuntu, Debian, Mint e derivados |
| Linux | `DeskClock_x.y.z_amd64.AppImage` | Qualquer distro (incluindo Arch) — sem instalação |
| Windows | `DeskClock_x.y.z_x64.msi` | Instalador MSI (recomendado para empresas) |
| Windows | `DeskClock_x.y.z_x64-setup.exe` | Instalador NSIS (recomendado para usuários finais) |

#### Publicar o rascunho

Após o workflow concluir:
1. Acesse **Releases** no repositório
2. Abra o rascunho gerado
3. Revise a descrição, adicione notas de versão se necessário
4. Clique em **Publish release**

---

## Estrutura do projeto

```
src/
├── domain/           # Entidades, repositórios (interfaces) e casos de uso
│   ├── entities/     # Task, PlannedTask, Project, Category, ExportProfile
│   ├── repositories/ # Interfaces (ports)
│   └── usecases/     # Lógica de negócio pura, sem dependências de framework
├── infra/            # Implementações concretas
│   └── database/     # Repositórios SQLite via tauri-plugin-sql
├── presentation/     # React UI
│   ├── pages/        # Tasks, Planning, Retroactive, History, Data, Settings
│   ├── components/   # Autocomplete, DatePickerInput, Sidebar…
│   ├── overlays/     # Execution, Planning, Compact, Welcome
│   ├── modals/       # EditTaskModal, ExportModal…
│   ├── hooks/        # useRunningTask, useHistory, usePlannedTasks…
│   └── contexts/     # ConfigContext (configurações globais)
├── shared/           # Types, utils (time, groupTasks, fontSize, theme)
└── tests/            # Espelha src/ — unit tests com Vitest
src-tauri/            # Backend Rust (Tauri)
├── src/lib.rs        # Comandos, tray, atalhos globais, janelas
├── capabilities/     # Permissões por janela (default.json)
└── Cargo.toml
.github/
├── workflows/ci.yml       # Testes e lint em todo push/PR
└── workflows/release.yml  # Build multiplataforma e publicação de release
```

---

## Convenções de desenvolvimento

- Commits semânticos: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Branches: `feat/<nome>`, `fix/<nome>`, `refactor/<nome>`, `chore/<nome>`
- `main` sempre estável e com testes passando
- Pull requests devem passar no CI antes do merge

---

## Versionamento

O projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/):

- **MAJOR** (`v1.0.0`): mudanças incompatíveis
- **MINOR** (`v0.2.0`): novas funcionalidades retrocompatíveis
- **PATCH** (`v0.1.1`): correções de bugs

A versão é definida em `tauri.conf.json` (`"version"`) e deve estar alinhada com `Cargo.toml`.

---

## Pendências (próximas versões)

- [ ] Modo de envio (selecionar tarefas → enviar para integração externa)
- [ ] Integração Google Sheets
- [ ] Integração Google Calendar
