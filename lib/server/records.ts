import { randomUUID } from "node:crypto";

import { ensureSchema, getPool } from "./db";

import type {
    BodyMeasure,
    CustomColumn,
    DietRecord,
    HabitRecord,
    SkinProduct,
    SkinRecord,
    SleepRecord,
    TrainingActionItem,
    TrainingRecord,
} from "@/lib/types";

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
type SleepRow = {
    id: string;
    date: string;
    sleep_time: string;
    wake_time: string;
    nap_minutes: number;
    quality: number;
    note: string;
};
type HabitRecordRow = { id: string; date: string; a: number; b: number };
type SkinProductRow = { id: string; category: string; name: string };
type TrainingActionItemRow = { id: string; group_key: string; name: string };
type CustomColumnRow = { id: string; key: string; label: string };

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

function mapSleep(row: SleepRow): SleepRecord {
    return {
        id: row.id,
        date: row.date,
        sleepTime: row.sleep_time ?? "",
        wakeTime: row.wake_time ?? "",
        napMinutes: row.nap_minutes ?? 0,
        quality: row.quality ?? 0,
        note: row.note ?? "",
    };
}

function mapHabitRecord(row: HabitRecordRow): HabitRecord {
    return { id: row.id, date: row.date, a: row.a ?? 0, b: row.b ?? 0 };
}

function mapSkinProduct(row: SkinProductRow): SkinProduct {
    return { id: row.id, category: row.category, name: row.name };
}

function mapTrainingActionItem(row: TrainingActionItemRow): TrainingActionItem {
    return { id: row.id, group: row.group_key, name: row.name };
}

function mapCustomColumn(row: CustomColumnRow): CustomColumn {
    return { id: row.id, key: row.key, label: row.label };
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

// ---------- sleep ----------
export async function listSleep(): Promise<SleepRecord[]> {
    await ensureSchema();
    const { rows } = await getPool().query<SleepRow>("select * from sleep_records");
    return rows.map(mapSleep);
}

export async function saveSleep(r: SleepRecord): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into sleep_records (id, date, sleep_time, wake_time, nap_minutes, quality, note)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (id) do update set
       date = excluded.date, sleep_time = excluded.sleep_time, wake_time = excluded.wake_time,
       nap_minutes = excluded.nap_minutes, quality = excluded.quality, note = excluded.note`,
        [r.id, r.date, r.sleepTime, r.wakeTime, r.napMinutes, r.quality, r.note]
    );
}

export async function deleteSleep(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from sleep_records where id = $1", [id]);
}

export async function clearSleep(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from sleep_records");
}

// ---------- habit records ----------
export async function listHabitRecords(): Promise<HabitRecord[]> {
    await ensureSchema();
    const { rows } = await getPool().query<HabitRecordRow>("select * from habit_records");
    return rows.map(mapHabitRecord);
}

export async function saveHabitRecord(record: HabitRecord): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into habit_records (id, date, a, b)
     values ($1, $2, $3, $4)
     on conflict (id) do update set date = excluded.date, a = excluded.a, b = excluded.b`,
        [record.id, record.date, record.a, record.b]
    );
}

export async function deleteHabitRecord(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from habit_records where id = $1", [id]);
}

export async function clearHabitRecords(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from habit_records");
}

// ---------- skin products ----------
export async function listSkinProducts(): Promise<SkinProduct[]> {
    await ensureSchema();
    const { rows } = await getPool().query<SkinProductRow>("select * from skin_products");
    return rows.map(mapSkinProduct);
}

export async function saveSkinProduct(p: SkinProduct): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into skin_products (id, category, name)
     values ($1, $2, $3)
     on conflict (id) do update set category = excluded.category, name = excluded.name`,
        [p.id, p.category, p.name]
    );
}

export async function deleteSkinProduct(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from skin_products where id = $1", [id]);
}

export async function clearSkinProducts(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from skin_products");
}

// ---------- training action items ----------
export async function listTrainingActionItems(): Promise<TrainingActionItem[]> {
    await ensureSchema();
    const { rows } = await getPool().query<TrainingActionItemRow>("select * from training_action_items");
    return rows.map(mapTrainingActionItem);
}

export async function saveTrainingActionItem(item: TrainingActionItem): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into training_action_items (id, group_key, name)
     values ($1, $2, $3)
     on conflict (id) do update set group_key = excluded.group_key, name = excluded.name`,
        [item.id, item.group, item.name]
    );
}

export async function deleteTrainingActionItem(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from training_action_items where id = $1", [id]);
}

export async function clearTrainingActionItems(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from training_action_items");
}

// ---------- skin custom columns ----------
export async function listSkinColumns(): Promise<CustomColumn[]> {
    await ensureSchema();
    const { rows } = await getPool().query<CustomColumnRow>("select * from skin_custom_columns");
    return rows.map(mapCustomColumn);
}

export async function saveSkinColumn(col: CustomColumn): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into skin_custom_columns (id, key, label)
     values ($1, $2, $3)
     on conflict (id) do update set key = excluded.key, label = excluded.label`,
        [col.id, col.key, col.label]
    );
}

export async function deleteSkinColumn(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from skin_custom_columns where id = $1", [id]);
}

export async function clearSkinColumns(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from skin_custom_columns");
}

// ---------- training custom columns ----------
export async function listTrainingColumns(): Promise<CustomColumn[]> {
    await ensureSchema();
    const { rows } = await getPool().query<CustomColumnRow>("select * from training_custom_columns");
    return rows.map(mapCustomColumn);
}

export async function saveTrainingColumn(col: CustomColumn): Promise<void> {
    await ensureSchema();
    await getPool().query(
        `insert into training_custom_columns (id, key, label)
     values ($1, $2, $3)
     on conflict (id) do update set key = excluded.key, label = excluded.label`,
        [col.id, col.key, col.label]
    );
}

export async function deleteTrainingColumn(id: string): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from training_custom_columns where id = $1", [id]);
}

export async function clearTrainingColumns(): Promise<void> {
    await ensureSchema();
    await getPool().query("delete from training_custom_columns");
}

export interface AllRecords {
    body: BodyMeasure[];
    diet: DietRecord[];
    skin: SkinRecord[];
    training: TrainingRecord[];
    sleep: SleepRecord[];
    habitRecords: HabitRecord[];
    skinProducts: SkinProduct[];
    trainingActionItems: TrainingActionItem[];
    skinColumns: CustomColumn[];
    trainingColumns: CustomColumn[];
}

export async function fetchAll(): Promise<AllRecords> {
    await ensureSchema();
    const [
        body,
        diet,
        skin,
        training,
        sleep,
        habitRecords,
        skinProducts,
        trainingActionItems,
        skinColumns,
        trainingColumns,
    ] = await Promise.all([
        listBody(),
        listDiet(),
        listSkin(),
        listTraining(),
        listSleep(),
        listHabitRecords(),
        listSkinProducts(),
        listTrainingActionItems(),
        listSkinColumns(),
        listTrainingColumns(),
    ]);
    return {
        body,
        diet,
        skin,
        training,
        sleep,
        habitRecords,
        skinProducts,
        trainingActionItems,
        skinColumns,
        trainingColumns,
    };
}

export interface BulkImportInput {
    skin: Omit<SkinRecord, "id">[];
    training: Omit<TrainingRecord, "id">[];
    diet: Omit<DietRecord, "id">[];
    sleep: Omit<SleepRecord, "id">[];
    body: Omit<BodyMeasure, "id">[];
    habitRecords: Omit<HabitRecord, "id">[];
    skinProducts: Omit<SkinProduct, "id">[];
    trainingActionItems: Omit<TrainingActionItem, "id">[];
}

export interface BulkImportResult {
    skin: SkinRecord[];
    training: TrainingRecord[];
    diet: DietRecord[];
    sleep: SleepRecord[];
    body: BodyMeasure[];
    habitRecords: HabitRecord[];
    skinProducts: SkinProduct[];
    trainingActionItems: TrainingActionItem[];
}

// 批量导入：单事务一次性写入全部记录，服务端生成 id，返回已写入的完整记录
export async function bulkImport(input: BulkImportInput): Promise<BulkImportResult> {
    await ensureSchema();

    const skin: SkinRecord[] = input.skin.map((r) => ({ ...r, id: randomUUID() }));
    const training: TrainingRecord[] = input.training.map((r) => ({ ...r, id: randomUUID() }));
    const diet: DietRecord[] = input.diet.map((r) => ({ ...r, id: randomUUID() }));
    const sleep: SleepRecord[] = input.sleep.map((r) => ({ ...r, id: randomUUID() }));
    const body: BodyMeasure[] = input.body.map((r) => ({ ...r, id: randomUUID() }));
    const habitRecords: HabitRecord[] = input.habitRecords.map((r) => ({
        ...r,
        id: randomUUID(),
    }));
    const skinProducts: SkinProduct[] = input.skinProducts.map((p) => ({
        ...p,
        id: randomUUID(),
    }));
    const trainingActionItems: TrainingActionItem[] = input.trainingActionItems.map((i) => ({
        ...i,
        id: randomUUID(),
    }));

    const client = await getPool().connect();
    try {
        await client.query("begin");

        for (const r of skin) {
            await client.query(
                `insert into skin_records (id, date, steps, note)
                 values ($1, $2, $3::jsonb, $4)`,
                [r.id, r.date, JSON.stringify(r.steps), r.note]
            );
        }
        for (const r of training) {
            await client.query(
                `insert into training_records (id, date, body_parts, actions, note)
                 values ($1, $2, $3::jsonb, $4::jsonb, $5)`,
                [r.id, r.date, JSON.stringify(r.bodyParts), JSON.stringify(r.actions), r.note]
            );
        }
        for (const r of diet) {
            await client.query(
                `insert into diet_records (id, date, meals, note)
                 values ($1, $2, $3::jsonb, $4)`,
                [r.id, r.date, JSON.stringify(r.meals), r.note]
            );
        }
        for (const r of sleep) {
            await client.query(
                `insert into sleep_records (id, date, sleep_time, wake_time, nap_minutes, quality, note)
                 values ($1, $2, $3, $4, $5, $6, $7)`,
                [r.id, r.date, r.sleepTime, r.wakeTime, r.napMinutes, r.quality, r.note]
            );
        }
        for (const r of body) {
            await client.query(
                `insert into body_measures
                 (id, date, height, weight, waist, hip, arm_left, arm_right, thigh_left, thigh_right, note)
                 values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
                [
                    r.id, r.date, r.height ?? null, r.weight ?? null, r.waist ?? null,
                    r.hip ?? null, r.armLeft ?? null, r.armRight ?? null,
                    r.thighLeft ?? null, r.thighRight ?? null, r.note ?? null,
                ]
            );
        }
        for (const r of habitRecords) {
            await client.query(
                `insert into habit_records (id, date, a, b)
                 values ($1, $2, $3, $4)`,
                [r.id, r.date, r.a, r.b]
            );
        }
        for (const p of skinProducts) {
            await client.query(
                `insert into skin_products (id, category, name)
                 values ($1, $2, $3)`,
                [p.id, p.category, p.name]
            );
        }
        for (const i of trainingActionItems) {
            await client.query(
                `insert into training_action_items (id, group_key, name)
                 values ($1, $2, $3)`,
                [i.id, i.group, i.name]
            );
        }

        await client.query("commit");
    } catch (e) {
        await client.query("rollback");
        throw e;
    } finally {
        client.release();
    }

    return { skin, training, diet, sleep, body, habitRecords, skinProducts, trainingActionItems };
}