import { SCHEMA_SQL } from "./schema";

// ---- Unified DB interface that works with both better-sqlite3 (dev) and Turso/libSQL (prod) ----

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const USE_TURSO = Boolean(TURSO_URL);

type TableColumnInfo = { name: string };

const USER_COLUMN_MIGRATIONS: Array<{ name: string; definition: string }> = [
  { name: "custom_css", definition: "custom_css TEXT DEFAULT ''" },
  { name: "bg_type", definition: "bg_type TEXT NOT NULL DEFAULT 'theme'" },
  { name: "bg_color", definition: "bg_color TEXT DEFAULT ''" },
  { name: "bg_gradient_from", definition: "bg_gradient_from TEXT DEFAULT ''" },
  { name: "bg_gradient_to", definition: "bg_gradient_to TEXT DEFAULT ''" },
  { name: "bg_gradient_direction", definition: "bg_gradient_direction TEXT NOT NULL DEFAULT 'top-bottom'" },
  { name: "bg_image_url", definition: "bg_image_url TEXT DEFAULT ''" },
  { name: "btn_shape", definition: "btn_shape TEXT NOT NULL DEFAULT 'rounded'" },
  { name: "btn_color", definition: "btn_color TEXT DEFAULT ''" },
  { name: "btn_text_color", definition: "btn_text_color TEXT DEFAULT ''" },
  { name: "btn_hover", definition: "btn_hover TEXT NOT NULL DEFAULT 'scale'" },
  { name: "btn_shadow", definition: "btn_shadow TEXT NOT NULL DEFAULT 'soft'" },
  { name: "font_family", definition: "font_family TEXT NOT NULL DEFAULT 'Inter'" },
  { name: "font_size", definition: "font_size TEXT NOT NULL DEFAULT 'medium'" },
  { name: "text_color", definition: "text_color TEXT DEFAULT ''" },
  { name: "layout", definition: "layout TEXT NOT NULL DEFAULT 'centered'" },
  { name: "avatar_shape", definition: "avatar_shape TEXT NOT NULL DEFAULT 'circle'" },
  { name: "avatar_border", definition: "avatar_border TEXT NOT NULL DEFAULT 'none'" },
];

const LINK_COLUMN_MIGRATIONS: Array<{ name: string; definition: string }> = [
  { name: "bg_color", definition: "bg_color TEXT DEFAULT ''" },
  { name: "text_color", definition: "text_color TEXT DEFAULT ''" },
  { name: "shape", definition: "shape TEXT DEFAULT ''" },
];

// ===== TURSO (libSQL) adapter =====

interface TursoClient {
  execute(opts: { sql: string; args?: unknown[] }): Promise<{ rows: Record<string, unknown>[]; lastInsertRowid?: bigint | number }>;
  batch(stmts: Array<{ sql: string; args?: unknown[] }>): Promise<unknown>;
}

let tursoClient: TursoClient | null = null;

async function getTurso(): Promise<TursoClient> {
  if (tursoClient) return tursoClient;
  const { createClient } = await import("@libsql/client");
  tursoClient = createClient({ url: TURSO_URL!, authToken: TURSO_TOKEN });
  // Run schema
  const stmts = SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean).map((sql) => ({ sql: sql + ";" }));
  await tursoClient.batch(stmts);
  // Run migrations
  for (const { table, migrations } of [
    { table: "users", migrations: USER_COLUMN_MIGRATIONS },
    { table: "links", migrations: LINK_COLUMN_MIGRATIONS },
  ]) {
    const res = await tursoClient.execute({ sql: `PRAGMA table_info(${table})` });
    const existing = new Set(res.rows.map((r) => r.name as string));
    for (const col of migrations) {
      if (!existing.has(col.name)) {
        try { await tursoClient.execute({ sql: `ALTER TABLE ${table} ADD COLUMN ${col.definition}` }); } catch { /* column may exist */ }
      }
    }
  }
  return tursoClient;
}

// ===== better-sqlite3 adapter (local dev) =====

type SqliteDb = {
  prepare(sql: string): { get(...args: unknown[]): unknown; all(...args: unknown[]): unknown[]; run(...args: unknown[]): { lastInsertRowid: number | bigint } };
  pragma(s: string): void;
  exec(s: string): void;
};

let sqliteDb: SqliteDb | null = null;

function getSqlite(): SqliteDb {
  if (sqliteDb) return sqliteDb;

  // Check globalThis for hot-reload
  if ((globalThis as Record<string, unknown>).__linkself_db) {
    sqliteDb = (globalThis as Record<string, unknown>).__linkself_db as SqliteDb;
    return sqliteDb;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  const path = require("path");
  const dbPath = path.resolve(process.cwd(), "linkself.db");
  sqliteDb = new Database(dbPath) as SqliteDb;
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("foreign_keys = ON");
  sqliteDb.exec(SCHEMA_SQL);

  // Migrations
  for (const { table, migrations } of [
    { table: "users", migrations: USER_COLUMN_MIGRATIONS },
    { table: "links", migrations: LINK_COLUMN_MIGRATIONS },
  ]) {
    const cols = sqliteDb.prepare(`PRAGMA table_info(${table})`).all() as TableColumnInfo[];
    const existing = new Set(cols.map((c) => c.name));
    for (const col of migrations) {
      if (!existing.has(col.name)) {
        sqliteDb.exec(`ALTER TABLE ${table} ADD COLUMN ${col.definition}`);
      }
    }
  }

  (globalThis as Record<string, unknown>).__linkself_db = sqliteDb;
  return sqliteDb;
}

// ===== Unified query helpers =====

export function queryOne<T>(sql: string, ...params: unknown[]): T | undefined {
  if (USE_TURSO) {
    throw new Error("Use queryOneAsync in Turso mode");
  }
  return getSqlite().prepare(sql).get(...params) as T | undefined;
}

export function queryAll<T>(sql: string, ...params: unknown[]): T[] {
  if (USE_TURSO) {
    throw new Error("Use queryAllAsync in Turso mode");
  }
  return getSqlite().prepare(sql).all(...params) as T[];
}

export function execute(sql: string, ...params: unknown[]): { lastInsertRowid: number | bigint } {
  if (USE_TURSO) {
    throw new Error("Use executeAsync in Turso mode");
  }
  return getSqlite().prepare(sql).run(...params);
}

// Async versions for Turso
export async function queryOneAsync<T>(sql: string, ...params: unknown[]): Promise<T | undefined> {
  if (!USE_TURSO) return queryOne<T>(sql, ...params);
  const client = await getTurso();
  const result = await client.execute({ sql, args: params });
  return (result.rows[0] as T) ?? undefined;
}

export async function queryAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  if (!USE_TURSO) return queryAll<T>(sql, ...params);
  const client = await getTurso();
  const result = await client.execute({ sql, args: params });
  return result.rows as T[];
}

export async function executeAsync(sql: string, ...params: unknown[]): Promise<{ lastInsertRowid: number | bigint }> {
  if (!USE_TURSO) return execute(sql, ...params);
  const client = await getTurso();
  const result = await client.execute({ sql, args: params });
  return { lastInsertRowid: result.lastInsertRowid ?? 0 };
}

// For backwards compat — getDb still works in local dev
export function getDb(): SqliteDb {
  if (USE_TURSO) throw new Error("getDb() not available in Turso mode");
  return getSqlite();
}
