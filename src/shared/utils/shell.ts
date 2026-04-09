import { invoke } from "@tauri-apps/api/core";

/**
 * Abre uma URL no navegador padrão do SO via comando Rust.
 * Substitui `openUrl` do tauri-plugin-opener para evitar problemas
 * de escopo de permissão no Windows.
 */
export async function openInBrowser(url: string): Promise<void> {
  await invoke("open_in_browser", { url });
}

/**
 * Abre um arquivo ou pasta no explorador de arquivos padrão do SO.
 * Substitui `openPath` do tauri-plugin-opener.
 */
export async function openInFileManager(path: string): Promise<void> {
  await invoke("open_in_file_manager", { path });
}

/**
 * Retorna a plataforma atual no formato Node.js/Electron:
 * "win32" | "darwin" | "linux"
 */
export async function getPlatform(): Promise<string> {
  return invoke<string>("get_platform");
}
