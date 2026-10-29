"use server";

import * as db from "@/lib/server/records";

import type { BodyMeasure, DietRecord, SkinRecord, TrainingRecord } from "@/lib/types";

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