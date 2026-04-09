import { getDb } from "./db";
import type { IConfigRepository } from "@domain/repositories/IConfigRepository";

interface ConfigRow {
  key: string;
  value: string;
}

export class ConfigRepository implements IConfigRepository {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    const db = await getDb();
    const rows = await db.select<ConfigRow[]>("SELECT value FROM config WHERE key = $1", [key]);
    if (!rows[0]) return defaultValue;
    try {
      return JSON.parse(rows[0].value) as T;
    } catch {
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await getDb();
    await db.execute(
      "INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2",
      [key, JSON.stringify(value)]
    );
  }

  async delete(key: string): Promise<void> {
    const db = await getDb();
    await db.execute("DELETE FROM config WHERE key = $1", [key]);
  }
}
