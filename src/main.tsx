import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./index.css";
import App from "./App";
import { CompactOverlayApp } from "@presentation/overlays/CompactOverlayApp";
import { ExecutionOverlayApp } from "@presentation/overlays/ExecutionOverlayApp";
import { PlanningOverlayApp } from "@presentation/overlays/PlanningOverlayApp";
import { ToastApp } from "@presentation/overlays/ToastApp";
import { CommandPaletteApp } from "@presentation/overlays/CommandPaletteApp";

const label = getCurrentWindow().label;

const root = createRoot(document.getElementById("root")!);

if (label === "overlay-compact") {
  root.render(<StrictMode><CompactOverlayApp /></StrictMode>);
} else if (label === "overlay-execution") {
  root.render(<StrictMode><ExecutionOverlayApp /></StrictMode>);
} else if (label === "overlay-planning") {
  root.render(<StrictMode><PlanningOverlayApp /></StrictMode>);
} else if (label === "toast") {
  root.render(<StrictMode><ToastApp /></StrictMode>);
} else if (label === "command-palette") {
  root.render(<StrictMode><CommandPaletteApp /></StrictMode>);
} else {
  root.render(<StrictMode><App /></StrictMode>);
}
