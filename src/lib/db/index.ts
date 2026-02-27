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
  { name: "nsfw", definition: "nsfw INTEGER NOT NULL DEFAULT 0" },
  { name: "tip_enabled", definition: "tip_enabled INTEGER NOT NULL DEFAULT 0" },
  { name: "tip_text", definition: "tip_text TEXT DEFAULT 'Buy me a coffee ☕'" },
  { name: "tip_url", definition: "tip_url TEXT DEFAULT ''" },
];

const LINK_COLUMN_MIGRATIONS: Array<{ name: string; definition: string }> = [
  { name: "bg_color", definition: "bg_color TEXT DEFAULT ''" },
  { name: "text_color", definition: "text_color TEXT DEFAULT ''" },
  { name: "shape", definition: "shape TEXT DEFAULT ''" },
  { name: "nsfw", definition: "nsfw INTEGER NOT NULL DEFAULT 0" },
];

// ===== TURSO (libSQL) adapter =====

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tursoClient: any = null;

async function getTurso() {
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
    const existing = new Set((res.rows as Record<string, unknown>[]).map((r) => r.name as string));
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

// ===== Unified query helpers (async — works with both SQLite and Turso) =====

export async function queryOne<T>(sql: string, ...params: unknown[]): Promise<T | undefined> {
  if (USE_TURSO) {
    const client = await getTurso();
    const result = await client.execute({ sql, args: params as never[] });
    return (result.rows[0] as T) ?? undefined;
  }
  return getSqlite().prepare(sql).get(...params) as T | undefined;
}

export async function queryAll<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  if (USE_TURSO) {
    const client = await getTurso();
    const result = await client.execute({ sql, args: params as never[] });
    return result.rows as T[];
  }
  return getSqlite().prepare(sql).all(...params) as T[];
}

export async function execute(sql: string, ...params: unknown[]): Promise<{ lastInsertRowid: number | bigint }> {
  if (USE_TURSO) {
    const client = await getTurso();
    const result = await client.execute({ sql, args: params as never[] });
    return { lastInsertRowid: result.lastInsertRowid ?? 0 };
  }
  return getSqlite().prepare(sql).run(...params);
}

// executeBatch — runs multiple statements in a transaction (works with both SQLite and Turso)
export async function executeBatch(statements: Array<{ sql: string; params: unknown[] }>): Promise<void> {
  if (USE_TURSO) {
    const client = await getTurso();
    await client.batch(statements.map((s) => ({ sql: s.sql, args: s.params as never[] })));
    return;
  }
  const db = getSqlite();
  db.exec("BEGIN");
  try {
    for (const stmt of statements) {
      db.prepare(stmt.sql).run(...stmt.params);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
