import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./index.css";
import App from "./App";
import { OverlayApp } from "@presentation/overlays/OverlayApp";

const label = getCurrentWindow().label;

const root = createRoot(document.getElementById("root")!);

if (label === "overlay") {
  root.render(
    <StrictMode>
      <OverlayApp />
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
