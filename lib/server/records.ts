import { ensureSchema, getPool } from "./db";

import type { BodyMeasure, DietRecord, SkinRecord, TrainingRecord } from "@/lib/types";

type BodyRow = {
    id: string;
    date: string;
    height: number | null;
    weight: number | null;
    waist: number | null;
    hip: number | null;
    arm_left: number | null;
    arm_right: number | null;
    thigh_left: number | null;
    thigh_right: number | null;
    note: string | null;
};

type DietRow = { id: string; date: string; meals: unknown; note: string };
type SkinRow = { id: string; date: string; steps: unknown; note: string };
type TrainingRow = { id: string; date: string; body_parts: unknown; actions: unknown; note: string };

function mapBody(row: BodyRow): BodyMeasure {
    return {
        id: row.id,
        date: row.date,
        height: row.height ?? undefined,
        weight: row.weight ?? undefined,
        waist: row.waist ?? undefined,
        hip: row.hip ?? undefined,
        armLeft: row.arm_left ?? undefined,
        armRight: row.arm_right ?? undefined,
        thighLeft: row.thigh_left ?? undefined,
        thighRight: row.thigh_right ?? undefined,
        note: row.note ?? undefined,
    };
}

function mapDiet(row: DietRow): DietRecord {
    return {
        id: row.id,
        date: row.date,
        meals: (row.meals ?? {}) as DietRecord["meals"],
        note: row.note ?? "",
    };
}

function mapSkin(row: SkinRow): SkinRecord {
    return {
        id: row.id,
        date: row.date,
        steps: (row.steps ?? {}) as SkinRecord["steps"],
        note: row.note ?? "",
    };
}

function mapTraining(row: TrainingRow): TrainingRecord {
    return {
        id: row.id,
        date: row.date,
        bodyParts: (row.body_parts ?? []) as string[],
        actions: (row.actions ?? []) as TrainingRecord["actions"],
        note: row.note ?? "",
    };
}

// ---------- body ----------
export async function listBody(): Promise<BodyMeasure[]> {
    await ensureSchema();
    const { rows } = await getPool().query<BodyRow>("select * from body_measures");
    return rows.map(mapBody);
}

export async function saveBody(m: BodyMeasure): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into body_measures
       (id, date, height, weight, waist, hip, arm_left, arm_right, thigh_left, thigh_right, note)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     on conflict (id) do update set
       date = excluded.date,
       height = excluded.height,
       weight = excluded.weight,
       waist = excluded.waist,
       hip = excluded.hip,
       arm_left = excluded.arm_left,
       arm_right = excluded.arm_right,
       thigh_left = excluded.thigh_left,
       thigh_right = excluded.thigh_right,
       note = excluded.note`,
        [
            m.id, m.date, m.height ?? null, m.weight ?? null, m.waist ?? null, m.hip ?? null,
            m.armLeft ?? null, m.armRight ?? null, m.thighLeft ?? null, m.thighRight ?? null,
            m.note ?? null,
        ]
    );
}

export async function deleteBody(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from body_measures where id = $1", [id]);
}

export async function clearBody(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from body_measures");
}

// ---------- diet ----------
export async function listDiet(): Promise<DietRecord[]> {
    await ensureSchema();
    const { rows } = await getPool().query<DietRow>("select * from diet_records");
    return rows.map(mapDiet);
}

export async function saveDiet(r: DietRecord): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into diet_records (id, date, meals, note)
     values ($1, $2, $3::jsonb, $4)
     on conflict (id) do update set
       date = excluded.date, meals = excluded.meals, note = excluded.note`,
        [r.id, r.date, JSON.stringify(r.meals), r.note]
    );
}

export async function deleteDiet(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from diet_records where id = $1", [id]);
}

export async function clearDiet(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from diet_records");
}

// ---------- skin ----------
export async function listSkin(): Promise<SkinRecord[]> {
    await ensureSchema();
    const { rows } = await getPool().query<SkinRow>("select * from skin_records");
    return rows.map(mapSkin);
}

export async function saveSkin(r: SkinRecord): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into skin_records (id, date, steps, note)
     values ($1, $2, $3::jsonb, $4)
     on conflict (id) do update set
       date = excluded.date, steps = excluded.steps, note = excluded.note`,
        [r.id, r.date, JSON.stringify(r.steps), r.note]
    );
}

export async function deleteSkin(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from skin_records where id = $1", [id]);
}

export async function clearSkin(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from skin_records");
}

// ---------- training ----------
export async function listTraining(): Promise<TrainingRecord[]> {
    await ensureSchema();
    const { rows } = await getPool().query<TrainingRow>("select * from training_records");
    return rows.map(mapTraining);
}

export async function saveTraining(r: TrainingRecord): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into training_records (id, date, body_parts, actions, note)
     values ($1, $2, $3::jsonb, $4::jsonb, $5)
     on conflict (id) do update set
       date = excluded.date, body_parts = excluded.body_parts,
       actions = excluded.actions, note = excluded.note`,
        [r.id, r.date, JSON.stringify(r.bodyParts), JSON.stringify(r.actions), r.note]
    );
}

export async function deleteTraining(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from training_records where id = $1", [id]);
}

export async function clearTraining(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from training_records");
}

export interface AllRecords {
    body: BodyMeasure[];
    diet: DietRecord[];
    skin: SkinRecord[];
    training: TrainingRecord[];
}

export async function fetchAll(): Promise<AllRecords> {
    await ensureSchema();
    const [body, diet, skin, training] = await Promise.all([
        listBody(),
        listDiet(),
        listSkin(),
        listTraining(),
    ]);
    return { body, diet, skin, training };
}