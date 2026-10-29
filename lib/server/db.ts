import { Pool } from "pg";

// 单用户直连 Supabase（pgBouncer 事务池端口 6543）
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("缺少 DATABASE_URL 环境变量，请在 .env.local 中配置");
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export const SCHEMA_SQL = `
create table if not exists body_measures (
  id text primary key,
  date text not null,
  height double precision,
  weight double precision,
  waist double precision,
  hip double precision,
  arm_left double precision,
  arm_right double precision,
  thigh_left double precision,
  thigh_right double precision,
  note text,
  updated_at timestamptz not null default now()
);

create table if not exists diet_records (
  id text primary key,
  date text not null,
  meals jsonb not null default '{}'::jsonb,
  note text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists skin_records (
  id text primary key,
  date text not null,
  steps jsonb not null default '{}'::jsonb,
  note text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists training_records (
  id text primary key,
  date text not null,
  body_parts jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  note text not null default '',
  updated_at timestamptz not null default now()
);
`;

let schemaReady: Promise<void> | null = null;

// 进程内幂等建表，避免每次请求都执行 DDL
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool().query(SCHEMA_SQL).then(() => undefined);
  }
  return schemaReady;
}