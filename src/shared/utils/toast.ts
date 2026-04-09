import { emit } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  OVERLAY_EVENTS,
  type ToastVariant,
  type ToastMessagePayload,
} from "@shared/types/overlayEvents";

export async function showToast(
  variant: ToastVariant,
  message: string,
  duration = 3500
): Promise<void> {
  const win = await WebviewWindow.getByLabel("toast");
  if (!win) return;
  await win.show();
  await emit(OVERLAY_EVENTS.TOAST_MESSAGE, {
    variant,
    message,
    duration,
  } satisfies ToastMessagePayload);
}
