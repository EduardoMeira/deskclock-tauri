# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.7.0](https://github.com/EduardoMeira/deskclock-tauri/compare/v0.6.0...v0.7.0) (2026-04-17)


### Bug Fixes

* bloquear play se tarefa já está rodando e corrigir ações na tela de planejamento ([81017a2](https://github.com/EduardoMeira/deskclock-tauri/commit/81017a2710ed280efd0c8a2a07eabb2d9f8c3239))
* corrigir layout de tarefa individual no modo de envio e toggle por clique na linha ([35fa681](https://github.com/EduardoMeira/deskclock-tauri/commit/35fa681379c1bcbba2484a03f2ac2b4270744b5f))
* corrigir race condition ao abrir main window pelo execution overlay ([3261d1d](https://github.com/EduardoMeira/deskclock-tauri/commit/3261d1d6c32fa8a37c832016b6ebabf534ce6cda))
* emitir PLANNED_TASKS_CHANGED após importação do Google Calendar ([06ac324](https://github.com/EduardoMeira/deskclock-tauri/commit/06ac324c2a107d37493ca7bd6a233577c21a9639))
* emitir PLANNED_TASKS_CHANGED após importação do Google Calendar ([9c74102](https://github.com/EduardoMeira/deskclock-tauri/commit/9c74102be6a956da281cf656a571202dab4c7ec4))
* ESC cancela edição inline sem fechar a janela ([533190f](https://github.com/EduardoMeira/deskclock-tauri/commit/533190ff514fe32480882347b77c7bc7792cb7c4))
* executar ações antes do startTask e guard contra duplo-clique ([0d3c2b3](https://github.com/EduardoMeira/deskclock-tauri/commit/0d3c2b351dd2868ace6722e3fb0cd0c14d3185e9))
* ignorar nós desconectados no handleOutside do PlannedTaskItem ([7bf2f4e](https://github.com/EduardoMeira/deskclock-tauri/commit/7bf2f4e7ce3e53281448519309a1758fb900fd7b))
* tratar formato HH:MM como horas:minutos no parseDurationInput ([444de22](https://github.com/EduardoMeira/deskclock-tauri/commit/444de229f0a5c178b2830cb56b6b22e86850a8dd))

## [0.6.0](https://github.com/EduardoMeira/deskclock-tauri/compare/v0.2.0...v0.6.0) (2026-04-15)


### Features

* adds app icons ([c64fa22](https://github.com/EduardoMeira/deskclock-tauri/commit/c64fa22aaa3a4282353e3521781075d9d9a35daf))
* regenerate all app icons ([1805669](https://github.com/EduardoMeira/deskclock-tauri/commit/180566961d2a9836e120ec47f20249f8889b3d0c))


### Bug Fixes

* adicionar logs detalhados no updater para diagnóstico ([72548ac](https://github.com/EduardoMeira/deskclock-tauri/commit/72548acef07992e1dd3009158be621194a9e7dd0))
* corrigir overlays e sincronização de tarefas planejadas ([1107619](https://github.com/EduardoMeira/deskclock-tauri/commit/11076192fa8d96bfc139a17de2fef76d53fedd25))
* exibir versão real do app na seção de atualizações ([3755775](https://github.com/EduardoMeira/deskclock-tauri/commit/375577541970c87edc32d9ae102a4dd6a597b0bb))
* **overlay:** generalizar HWND_TOPMOST para overlay, toast e welcome ([27f7ed6](https://github.com/EduardoMeira/deskclock-tauri/commit/27f7ed6788645dc8d3c78058236164bcb0684e56))
* **overlay:** usar SetWindowPos síncrono em vez de set_always_on_top ([487ff02](https://github.com/EduardoMeira/deskclock-tauri/commit/487ff02a726f1f2dae5c0435223c54e5231ce6d8))
* **sheets:** aplicar numberFormat [h]:mm:ss após envio ao Sheets e descartar tarefas < 1 min ([5873958](https://github.com/EduardoMeira/deskclock-tauri/commit/58739583ca3952b03968ff8fff17c2d4a488302e))

## [0.5.0](https://github.com/EduardoMeira/deskclock-tauri/compare/v0.2.0...v0.5.0) (2026-04-15)


### Features

* adds app icons ([c64fa22](https://github.com/EduardoMeira/deskclock-tauri/commit/c64fa22aaa3a4282353e3521781075d9d9a35daf))


### Bug Fixes

* **overlay:** generalizar HWND_TOPMOST para overlay, toast e welcome ([27f7ed6](https://github.com/EduardoMeira/deskclock-tauri/commit/27f7ed6788645dc8d3c78058236164bcb0684e56))
* **overlay:** usar SetWindowPos síncrono em vez de set_always_on_top ([487ff02](https://github.com/EduardoMeira/deskclock-tauri/commit/487ff02a726f1f2dae5c0435223c54e5231ce6d8))
* **sheets:** aplicar numberFormat [h]:mm:ss após envio ao Sheets e descartar tarefas < 1 min ([5873958](https://github.com/EduardoMeira/deskclock-tauri/commit/58739583ca3952b03968ff8fff17c2d4a488302e))

## [0.4.0](https://github.com/EduardoMeira/deskclock-tauri/compare/v0.2.0...v0.4.0) (2026-04-14)


### Features

* adds app icons ([c64fa22](https://github.com/EduardoMeira/deskclock-tauri/commit/c64fa22aaa3a4282353e3521781075d9d9a35daf))

## [0.4.0](https://github.com/EduardoMeira/deskclock-tauri/compare/v0.2.0...v0.4.0) (2026-04-14)


### Features

* adds app icons ([c64fa22](https://github.com/EduardoMeira/deskclock-tauri/commit/c64fa22aaa3a4282353e3521781075d9d9a35daf))

## [0.3.0](https://github.com/EduardoMeira/deskclock-tauri/compare/v0.2.0...v0.3.0) (2026-04-14)
