"use server";

import * as db from "@/lib/server/records";

import type { BulkImportInput } from "@/lib/server/records";
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

export async function fetchAllRecords() {
  return db.fetchAll();
}

// body
export async function saveBodyRecord(m: BodyMeasure) {
  await db.saveBody(m);
}
export async function deleteBodyRecord(id: string) {
  await db.deleteBody(id);
}
export async function clearBodyRecords() {
  await db.clearBody();
}

// diet
export async function saveDietRecord(r: DietRecord) {
  await db.saveDiet(r);
}
export async function deleteDietRecord(id: string) {
  await db.deleteDiet(id);
}
export async function clearDietRecords() {
  await db.clearDiet();
}

// skin
export async function saveSkinRecord(r: SkinRecord) {
  await db.saveSkin(r);
}
export async function deleteSkinRecord(id: string) {
  await db.deleteSkin(id);
}
export async function clearSkinRecords() {
  await db.clearSkin();
}

// training
export async function saveTrainingRecord(r: TrainingRecord) {
  await db.saveTraining(r);
}
export async function deleteTrainingRecord(id: string) {
  await db.deleteTraining(id);
}
export async function clearTrainingRecords() {
  await db.clearTraining();
}

// sleep
export async function saveSleepRecord(r: SleepRecord) {
  await db.saveSleep(r);
}
export async function deleteSleepRecord(id: string) {
  await db.deleteSleep(id);
}
export async function clearSleepRecords() {
  await db.clearSleep();
}

// habit records
export async function saveHabitRecordRecord(record: HabitRecord) {
  await db.saveHabitRecord(record);
}
export async function deleteHabitRecordRecord(id: string) {
  await db.deleteHabitRecord(id);
}
export async function clearHabitRecordsRecords() {
  await db.clearHabitRecords();
}

// skin products
export async function saveSkinProductRecord(p: SkinProduct) {
  await db.saveSkinProduct(p);
}
export async function deleteSkinProductRecord(id: string) {
  await db.deleteSkinProduct(id);
}
export async function clearSkinProductsRecords() {
  await db.clearSkinProducts();
}

// training action items
export async function saveTrainingActionItemRecord(item: TrainingActionItem) {
  await db.saveTrainingActionItem(item);
}
export async function deleteTrainingActionItemRecord(id: string) {
  await db.deleteTrainingActionItem(id);
}
export async function clearTrainingActionItemsRecords() {
  await db.clearTrainingActionItems();
}

// skin custom columns
export async function saveSkinColumnRecord(col: CustomColumn) {
  await db.saveSkinColumn(col);
}
export async function deleteSkinColumnRecord(id: string) {
  await db.deleteSkinColumn(id);
}
export async function clearSkinColumnsRecords() {
  await db.clearSkinColumns();
}

// training custom columns
export async function saveTrainingColumnRecord(col: CustomColumn) {
  await db.saveTrainingColumn(col);
}
export async function deleteTrainingColumnRecord(id: string) {
  await db.deleteTrainingColumn(id);
}
export async function clearTrainingColumnsRecords() {
  await db.clearTrainingColumns();
}

// 批量导入（一次性写全部，避免逐条并发丢请求）
export async function importRecords(input: BulkImportInput) {
  return db.bulkImport(input);
}