import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDb = {
  select: vi.fn(),
  execute: vi.fn(),
};

vi.mock("@infra/database/db", () => ({
  getDb: vi.fn(async () => mockDb),
}));

const { ConfigRepository } = await import("@infra/database/ConfigRepository");

describe("ConfigRepository", () => {
  let repo: InstanceType<typeof ConfigRepository>;

  beforeEach(() => {
    repo = new ConfigRepository();
    vi.clearAllMocks();
    mockDb.select.mockResolvedValue([]);
    mockDb.execute.mockResolvedValue({ rowsAffected: 1, lastInsertId: 0 });
  });

  describe("get", () => {
    it("retorna defaultValue quando chave não existe", async () => {
      const result = await repo.get("userName", "Usuário");
      expect(result).toBe("Usuário");
    });

    it("retorna valor parseado do banco quando chave existe", async () => {
      mockDb.select.mockResolvedValue([{ value: '"Eduardo"' }]);
      const result = await repo.get("userName", "");
      expect(result).toBe("Eduardo");
    });

    it("retorna defaultValue quando value é JSON inválido", async () => {
      mockDb.select.mockResolvedValue([{ value: "not-json{" }]);
      const result = await repo.get("userName", "fallback");
      expect(result).toBe("fallback");
    });

    it("suporta tipos complexos (object)", async () => {
      const pos = { x: 100, y: 200 };
      mockDb.select.mockResolvedValue([{ value: JSON.stringify(pos) }]);
      const result = await repo.get("overlayPosition_execution", { x: 0, y: 0 });
      expect(result).toEqual(pos);
    });

    it("suporta booleano false", async () => {
      mockDb.select.mockResolvedValue([{ value: "false" }]);
      const result = await repo.get("showWelcomeMessage", true);
      expect(result).toBe(false);
    });
  });

  describe("set", () => {
    it("faz upsert com valor serializado como JSON", async () => {
      await repo.set("userName", "Eduardo");
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO config"),
        ["userName", '"Eduardo"'],
      );
    });

    it("serializa objeto como JSON", async () => {
      await repo.set("overlayPosition_planning", { x: 50, y: 80 });
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.any(String),
        ["overlayPosition_planning", '{"x":50,"y":80}'],
      );
    });
  });

  describe("delete", () => {
    it("executa DELETE com a chave correta", async () => {
      await repo.delete("userName");
      expect(mockDb.execute).toHaveBeenCalledWith(
        "DELETE FROM config WHERE key = $1",
        ["userName"],
      );
    });
  });
});
