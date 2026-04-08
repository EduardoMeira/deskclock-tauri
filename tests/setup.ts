import { vi } from "vitest";

// Mock @tauri-apps/plugin-sql — não funciona fora do runtime Tauri
vi.mock("@tauri-apps/plugin-sql", () => ({
  default: {
    load: vi.fn(),
  },
}));

// Mock @infra/database/db — testes de repositório injetam seu próprio mock
vi.mock("@infra/database/db", () => ({
  getDb: vi.fn(),
}));

// Mock @tauri-apps/api/window
vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    label: "main",
    show: vi.fn(),
    hide: vi.fn(),
    setSize: vi.fn(),
    setPosition: vi.fn(),
    listen: vi.fn(() => Promise.resolve(() => {})),
  })),
}));

// Mock @tauri-apps/api/webviewWindow
vi.mock("@tauri-apps/api/webviewWindow", () => ({
  WebviewWindow: {
    getByLabel: vi.fn(() => ({
      show: vi.fn(),
      hide: vi.fn(),
      setSize: vi.fn(),
      setPosition: vi.fn(),
    })),
  },
}));

// Mock @tauri-apps/api/event
vi.mock("@tauri-apps/api/event", () => ({
  emit: vi.fn(),
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

// Mock @tauri-apps/api/dpi
vi.mock("@tauri-apps/api/dpi", () => ({
  PhysicalSize: vi.fn((w: number, h: number) => ({ width: w, height: h })),
  PhysicalPosition: vi.fn((x: number, y: number) => ({ x, y })),
  LogicalPosition: vi.fn((x: number, y: number) => ({ x, y })),
}));
