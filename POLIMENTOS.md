# POLIMENTOS.md — Backlog de Melhorias

> Itens categorizados por tipo e prioridade. Bugs bloqueiam releases; layout e UX são iterativos; features são planejamento futuro.
>
> Legenda: `✅` concluído · `🔧` em andamento · `⬜` pendente

---

## 1. Bugs Críticos
*Comportamento errado que afeta dados ou funcionalidades core.*

| # | Item | Status | Notas |
|---|------|--------|-------|
| B1 | App aberto após meia-noite mostra tarefas de ontem na listagem de hoje | ⬜ | Data boundary: alguma comparação usa data UTC em vez de local |
| B2 | Tarefas agrupadas sendo enviadas individualmente ao Sheets — deveria ir só o grupo | ⬜ | Modo de envio seleciona por grupo visualmente mas itera registros individuais |
| B3 | Envio via sync altera formatação da coluna na planilha | ⬜ | `batchUpdate` com `numberFormat` não deve ser chamado; apenas remover segundos se formato HH:MM |
| B4 | Toast de sucesso/falha do envio não dispara | ⬜ | Toast display corrigido (height + posição), mas o emit pode não estar sendo chamado no fluxo de envio |
| B5 | Ao iniciar com Welcome habilitado, janela principal aparece junto | ⬜ | Janela main deve iniciar oculta e só mostrar após welcome ser dispensada |

---

## 2. Bugs de Comportamento
*Funcionalidade presente mas com comportamento incorreto ou incompleto.*

| # | Item | Status | Notas |
|---|------|--------|-------|
| C1 | Overlay: janela não redimensiona ao confirmar parada de tarefa — conteúdo espremido | ✅ | `LogicalSize(280, 96)` ao entrar em `confirmingStop`; `LogicalSize` em todas as trocas de modo; `w-screen h-screen overflow-hidden` no root |
| C2 | Toast espremido e posicionado errado | ✅ | Height 72→88, `LogicalPosition` com `scaleFactor`, `w-screen h-screen` no root |
| C3 | Editar hora de início não disponível na tarefa em andamento | ⬜ | Campo deve aparecer na seção "tarefa atual" na tela de Tasks |
| C4 | Clique no nome da tarefa no overlay de execução não faz nada | ⬜ | Comportamento esperado: abrir modal de edição ou focar janela principal |
| C5 | Clicar em "Planejamento" na janela de boas-vindas não abre planejamento | ⬜ | Evento/comando Tauri para navegar até a página de planejamento |
| C6 | Grid (snap-to-grid) não aparece e não trava posições — só funciona após reiniciar | ⬜ | Estado de grid não é aplicado em tempo real; indicador visual ausente |
| C7 | Indicação visual no autocomplete para mostrar item selecionado (highlight) | ⬜ | Item ativo deve ter background diferenciado |
| C8 | Exigir projeto e/ou tarefa ao concluir tarefa (se não preenchidos) | ⬜ | Prompt inline antes de confirmar conclusão |
| C9 | Overlay compacto: arrastar só funciona pelas beiradas — botão central bloqueia o drag | ⬜ | O `button` com `absolute inset-0` intercepta mousedown impedindo o `data-tauri-drag-region` de atuar. Solução provável: mover o drag region para dentro do `button` ou usar `data-tauri-drag-region` diretamente no elemento pai sem botão sobreposto |

---

## 3. Melhorias de Layout e UX
*Visual e usabilidade — não bloqueantes mas afetam qualidade percebida.*

### 3.1 Navegação e estrutura

| # | Item | Status | Notas |
|---|------|--------|-------|
| L1 | Reordenar telas na sidebar: Tasks → Retroativo → Planejamento → Histórico → Dados → Integrações → Configs | ⬜ | Ajustar ordem dos ícones em `Sidebar.tsx` |
| L2 | Adicionar label de texto abaixo dos ícones na sidebar | ⬜ | Texto pequeno, sempre visível ou ao hover |
| L3 | Title bar customizada — remover barra padrão do Windows | ⬜ | `decorations: false` na janela main + implementar barra própria com minimize/maximize/close e título da página atual |
| L4 | Janela principal travada em posição fixa acima do tray | ⬜ | Posição inicial calculada com base na posição do tray (Tauri API) |

### 3.2 Overlays

| # | Item | Status | Notas |
|---|------|--------|-------|
| L5 | Overlay compacto: badge dentro dos limites da janela | ✅ | `top-0 right-0` em vez de `-top-1 -right-1`; botão reduzido para liberar anel externo como drag area; grip visual com 3 pontos |
| L6 | Overlay planning: altura dinâmica conforme quantidade de tarefas | ✅ | `useEffect` em `PlanningOverlayContent` chama `setSize(LogicalSize)` baseado em `pending.length`; máx 6 linhas visíveis |
| L7 | Overlay de execução: revisar espaçamento e tipografia | ⬜ | Legibilidade do timer, espaçamento geral |
| L8 | Overlay idle (planning): botão "Nova tarefa" deve aparecer no topo, não após lista extensa | ⬜ | Mover botão para acima da lista de tarefas planejadas |
| L9 | Incrementar menu do tray icon com mais controles | ⬜ | Ex: Iniciar/Parar tarefa, Mostrar/Ocultar janela, sair |
| L10 | Reavaliar quais configurações de overlay fazem sentido ser parametrizáveis | ⬜ | Candidatos a fixar: snap-to-grid, indicador de grade |

### 3.3 Telas específicas

| # | Item | Status | Notas |
|---|------|--------|-------|
| L11 | Tela de Tasks: formato mais compacto para tarefas individuais (não-grupo) | ⬜ | Tarefas sem grupo não deveriam ter cabeçalho que repete a informação da tarefa |
| L12 | Tela de Tasks: limitar altura máxima da seção "planejadas para hoje" | ⬜ | Evitar que lista extensa empurre "entradas de hoje" para fora da viewport |
| L13 | Tela de Lançamento Retroativo: elementos parecem desposicionados | ⬜ | Revisar grid/layout do formulário e da lista |
| L14 | Tela de Dados: revisão geral de layout | ⬜ | A definir após outras telas estabilizarem |
| L15 | Tela de Integrações: usar accordion — detalhes só ao expandir | ⬜ | Card por integração colapsável; estado inicial: colapsado |
| L16 | Tela de Configurações: scroll quando mapeamento de colunas está expandido | ⬜ | Overflow-y na seção, não na página toda |

### 3.4 Componentes globais

| # | Item | Status | Notas |
|---|------|--------|-------|
| L17 | Scrollbars com estilo uniforme e clean em todas as telas | ⬜ | CSS global via `::-webkit-scrollbar` |
| L18 | Atalhos globais: permitir "Gravar atalho" ao invés de digitar manualmente | ⬜ | Capturar `keydown` em modo de gravação e exibir combinação |
| L19 | Tela de Planejamento: botão "Hoje" antes do input de data (não depois) | ⬜ | Inversão de ordem no `PlannedTaskForm` |

---

## 4. Features Novas
*Escopo novo — planejamento futuro.*

| # | Item | Status | Notas |
|---|------|--------|-------|
| F1 | API local (REST/WebSocket) para integração com apps terceiros | ⬜ | Permite automação externa: iniciar/parar tarefas, consultar status. Avaliar com `tauri-plugin-http` ou servidor interno |
| F2 | Sistema de login/conta | ⬜ | Permitir uso pessoal vs. trabalho com perfis separados. Alta complexidade — avaliar motivação e escopo |

---

## Ordem de execução sugerida

```
Sprint 1 — Bugs críticos e comportamentais bloqueantes
  B1, B2, B3, B4, B5, C3, C5, C9

Sprint 2 — Estrutura de navegação
  L1, L2, L3, L4

Sprint 3 — Overlays
  L7, L8, L9, L10, C6

Sprint 4 — Telas e componentes
  L11, L12, L13, L14, L15, L16, L17, L18, L19

Sprint 5 — Comportamentais restantes
  C4, C7, C8

Sprint 6 — Features novas
  F1, F2
```

---

*Última atualização: 09/04/2026*
