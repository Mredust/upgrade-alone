// 初始化 Supabase 表结构（幂等）
// 用法：$env:DATABASE_URL="postgresql://..."; node scripts/init-db.mjs
import pg from "pg";

const { Pool } = pg;

const schema = `
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

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("缺少 DATABASE_URL 环境变量");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query("select 1");
    console.log("已连接 Supabase");
    await pool.query(schema);
    console.log("表结构已就绪：body_measures / diet_records / skin_records / training_records");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("初始化失败：", err.message);
  process.exit(1);
});