#[derive(serde::Serialize)]
pub struct UpdateInfo {
    pub version: String,
    pub body: Option<String>,
}

/// Verifica se há atualização disponível.
/// Retorna Some(UpdateInfo) se sim, None se o app já está na versão mais recente.
#[tauri::command]
pub async fn check_for_update(
    app: tauri::AppHandle,
) -> Result<Option<UpdateInfo>, String> {
    use tauri_plugin_updater::UpdaterExt;
    match app
        .updater_builder()
        .build()
        .map_err(|e| e.to_string())?
        .check()
        .await
    {
        Ok(Some(update)) => Ok(Some(UpdateInfo {
            version: update.version.clone(),
            body: update.body.clone(),
        })),
        Ok(None) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

/// Baixa e instala a atualização, emitindo progresso via evento Tauri.
/// Ao terminar, o frontend deve chamar relaunch_app() para reiniciar.
#[tauri::command]
pub async fn download_and_install_update(app: tauri::AppHandle) -> Result<(), String> {
    use tauri::Emitter;
    use tauri_plugin_updater::UpdaterExt;

    let update = app
        .updater_builder()
        .build()
        .map_err(|e| e.to_string())?
        .check()
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Nenhuma atualização encontrada".to_string())?;

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

/// Reinicia o aplicativo (chamado após instalação de atualização).
#[tauri::command]
pub fn relaunch_app(app: tauri::AppHandle) {
    app.restart();
}
