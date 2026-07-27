// Minimal in-memory Supabase stand-in covering only the query shapes this
// app actually issues (insert/upsert/update().eq()/select().eq().single()).
// Not a general Postgrest emulator — extend the call shapes below if a new
// handler needs one this doesn't support yet.

type Row = Record<string, unknown>;

const UNIQUE_KEYS: Record<string, string> = {
  stripe_webhook_events: "id",
  subscriptions: "stripe_subscription_id",
  edit_tokens: "client_id",
  addons: "stripe_subscription_id",
};

export type FakeSupabase = {
  tables: Record<string, Row[]>;
  calls: { table: string; op: string; payload?: unknown }[];
  from: (table: string) => TableApi;
};

class SelectBuilder {
  private filters: [string, unknown][] = [];
  constructor(
    private table: string,
    private db: FakeSupabase,
  ) {}
  eq(col: string, val: unknown) {
    this.filters.push([col, val]);
    return this;
  }
  private matches() {
    const rows = this.db.tables[this.table] ?? [];
    return rows.filter((r) => this.filters.every(([c, v]) => r[c] === v));
  }
  single() {
    const [row] = this.matches();
    return Promise.resolve({ data: row ?? null, error: row ? null : { message: "no rows" } });
  }
  maybeSingle() {
    const [row] = this.matches();
    return Promise.resolve({ data: row ?? null, error: null });
  }
}

class UpdateBuilder {
  constructor(
    private table: string,
    private db: FakeSupabase,
    private patch: Row,
  ) {}
  eq(col: string, val: unknown) {
    const rows = this.db.tables[this.table] ?? [];
    for (const r of rows) if (r[col] === val) Object.assign(r, this.patch);
    this.db.calls.push({ table: this.table, op: "update", payload: { patch: this.patch, col, val } });
    return Promise.resolve({ data: null, error: null });
  }
}

class TableApi {
  constructor(
    private table: string,
    private db: FakeSupabase,
  ) {}

  insert(row: Row) {
    const key = UNIQUE_KEYS[this.table];
    const rows = this.db.tables[this.table] ?? (this.db.tables[this.table] = []);
    if (key && rows.some((r) => r[key] === row[key])) {
      return Promise.resolve({ data: null, error: { code: "23505", message: "duplicate key" } });
    }
    rows.push({ ...row });
    this.db.calls.push({ table: this.table, op: "insert", payload: row });
    return Promise.resolve({ data: row, error: null });
  }

  upsert(row: Row, opts?: { onConflict?: string; ignoreDuplicates?: boolean }) {
    const rows = this.db.tables[this.table] ?? (this.db.tables[this.table] = []);
    const key = opts?.onConflict ?? UNIQUE_KEYS[this.table];
    const idx = key ? rows.findIndex((r) => r[key] === row[key]) : -1;
    if (idx >= 0) {
      if (!opts?.ignoreDuplicates) rows[idx] = { ...rows[idx], ...row };
    } else {
      rows.push({ ...row });
    }
    this.db.calls.push({ table: this.table, op: "upsert", payload: row });
    return Promise.resolve({ data: row, error: null });
  }

  update(patch: Row) {
    return new UpdateBuilder(this.table, this.db, patch);
  }

  select(_cols: string) {
    return new SelectBuilder(this.table, this.db);
  }
}

export function createFakeSupabase(seed: Record<string, Row[]> = {}): FakeSupabase {
  const db = {
    tables: structuredClone(seed),
    calls: [],
  } as FakeSupabase;
  db.from = (table: string) => new TableApi(table, db);
  return db;
}
