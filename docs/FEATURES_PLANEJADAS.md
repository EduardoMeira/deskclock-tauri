# FEATURES_PLANEJADAS.md — Backlog de Features Futuras

> Features planejadas mas ainda não priorizadas para implementação. Cada item deve ser refinado antes de entrar em sprint.
>
> Legenda: `⬜` pendente · `🔧` em refinamento

---

## F1 — API Local (REST/WebSocket)

**Status:** ⬜

**Descrição:**  
Expor uma API local que permita automação externa — iniciar/pausar/parar tarefas, consultar status da tarefa em execução — integrável com qualquer app de terceiros (Raycast, scripts, automações de SO).

**Opções técnicas:**
- `tauri-plugin-http` (servidor embutido)
- Servidor interno leve em Rust (tokio + axum/warp)
- WebSocket para push de eventos em tempo real

**Pontos a refinar antes da implementação:**
- Autenticação da API (token local? sem auth?)
- Quais endpoints são necessários no MVP
- Impacto no consumo de CPU/memória em idle

---

## F2 — Sistema de Login / Conta

**Status:** ⬜

**Descrição:**  
Permitir uso pessoal vs. profissional com perfis separados. Cada perfil teria seus próprios projetos, categorias, configurações e histórico.

**Pontos a refinar antes da implementação:**
- Escopo: perfis locais (offline) ou conta na nuvem?
- Impacto na arquitetura do banco de dados
- Fluxo de migração de dados de instalações existentes

---

## F3 — Arredondamento Automático de Duração

**Status:** ⬜

**Descrição:**  
Feature flag nas configurações do app. Quando ativada, ao parar uma tarefa, a duração registrada é arredondada para o intervalo de tempo mais próximo (configurável).

**Comportamento esperado:**
- O usuário ativa a feature em Configurações → Geral
- Ao parar uma tarefa, a duração é arredondada conforme as preferências salvas
- O `startTime` da tarefa não é alterado — apenas o `endTime` é ajustado para refletir a nova duração

**Slots de arredondamento (fixos):**  
A duração é arredondada para o múltiplo de 5 minutos mais próximo: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60 min — e assim por diante para durações maiores que 1h (65, 70, 75…).

Exemplo: tarefa de 22 min → arredonda para **20 min** (pra baixo) ou **25 min** (pra cima).

**Configurações necessárias:**
| Configuração | Tipo | Opções |
|---|---|---|
| Arredondamento ativado | toggle | on/off |
| Direção do arredondamento | select | Para cima · Para baixo |

**Pontos a refinar antes da implementação:**
- Exibir ou não o valor original ao lado do arredondado na task card
- Comportamento quando a tarefa é pausada e retomada (arredonda a duração total? cada segmento?)
- Aplicar também em tarefas do lançamento retroativo?

---

## F4 — Modos de Sincronização com Google Sheets

**Status:** ⬜

**Descrição:**  
Atualmente o app suporta apenas sincronização unitária (envia para a planilha cada vez que uma tarefa é concluída). Esta feature adiciona a opção de **sincronização diária** — o usuário define quando o envio consolidado do dia deve acontecer.

**Modos disponíveis:**
| Modo | Descrição |
|---|---|
| Por tarefa (atual) | Envia automaticamente para a planilha cada vez que uma tarefa é concluída |
| Diário — horário fixo | Envia todas as tarefas do dia em um horário definido pelo usuário (ex: 18:00) |
| Diário — ao abrir o app | Ao abrir o app, envia automaticamente todas as tarefas registradas no dia anterior |

**Configurações necessárias (modo diário):**
| Configuração | Tipo |
|---|---|
| Modo de sincronização | select: por tarefa / diário |
| Gatilho (se diário) | select: horário fixo / ao abrir o app |
| Horário (se gatilho = horário fixo) | time input (HH:MM) |

**Pontos a refinar antes da implementação:**
- Como garantir que o envio acontece mesmo que o app esteja minimizado no tray (tarefas agendadas via cron interno?)
- Tratamento de duplicidade: o que acontece se o envio diário rodar e algumas tarefas já foram enviadas unitariamente no mesmo dia?
- Indicador visual na UI de "último envio realizado em X"
- Comportamento se o horário configurado passa enquanto o app estava fechado

---

---

## S1 — Migrar OAuth para PKCE (Segurança)

**Status:** ⬜

**Descrição:**  
Atualmente o fluxo OAuth usa **Authorization Code + client_secret**, que fica embutido no bundle compilado do app e pode ser extraído por qualquer pessoa com acesso ao instalador. O fluxo **PKCE (Proof Key for Code Exchange)** elimina a necessidade do `client_secret` em apps desktop — foi criado exatamente para esse cenário.

**Problema atual:**
```typescript
// client_secret compilado no bundle — visível após descompactar o instalador
const CLIENT_SECRET = import.meta.env.GCP_CLIENT_SECRET as string;
```

**Solução com PKCE:**
```
1. App gera code_verifier (aleatório) + code_challenge (SHA-256 do verifier)
2. Inicia OAuth enviando code_challenge — sem client_secret
3. Google devolve o code
4. App troca code por token enviando code_verifier — Google valida o hash
5. Sem client_secret em nenhuma etapa
```

**O que muda na implementação:**
- Remover `GCP_CLIENT_SECRET` do `.env` e do código
- Adicionar geração de `code_verifier` e `code_challenge` no frontend antes de iniciar o fluxo
- Atualizar a troca de `code` por token para usar `code_verifier` em vez de `client_secret`
- Backend Rust (servidor OAuth local) não muda
- Configurar o app no Google Cloud Console como **Desktop app sem secret**

**Impacto:**
- `GCP_CLIENT_SECRET` sai completamente do projeto
- `.env` passa a ter apenas `GCP_CLIENT_ID`
- Conformidade com as políticas do Google para apps OAuth públicos

**Referência de decisão:** CLAUDE.md — Registro de Decisões 09/04/2026 (OAuth via Authorization Code aceito como trade-off de MVP)

---

*Última atualização: 15/04/2026*
