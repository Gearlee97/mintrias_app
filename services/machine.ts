/**
 * services/machine.ts
 * Machine helpers: per-player machines, default machine creator, get/update
 */
import { getDb } from '../lib/mongodb';
import { DEFAULT_BASE_RATE, DEBUG_DEFAULT_DURATION_SEC } from '../engine/constants';

/**
 * defaultMachineTemplate(playerId, idx)
 * - membuat template mesin default untuk player
 */
export function defaultMachineTemplate(playerId: string, idx: number = 1) {
  const id = `${playerId}-m${idx}`;
  return {
    id,
    ownerId: playerId,
    baseRate: DEFAULT_BASE_RATE,
    // gunakan debug duration kecil jika environment = development and DEBUG_DEFAULT_DURATION_SEC set
    durationSec: (process.env.NODE_ENV === 'development' && process.env.DEBUG_FAST === '1') ? DEBUG_DEFAULT_DURATION_SEC : 4 * 60 * 60,
    healthPct: 100,
    running: false,
    progressSec: 0,
    startAt: null,
    effectiveRate: undefined,
    effectiveDurationSec: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * getMachineById
 */
export async function getMachineById(machineId: string) {
  const db = await getDb();
  return db.collection('machines').findOne({ id: machineId });
}

/**
 * getMachinesByPlayer
 */
export async function getMachinesByPlayer(playerId: string) {
  const db = await getDb();
  return db.collection('machines').find({ ownerId: playerId }).toArray();
}

/**
 * createMachine
 */
export async function createMachine(machineDoc: any) {
  const db = await getDb();
  const doc = { ...machineDoc, createdAt: new Date(), updatedAt: new Date() };
  await db.collection('machines').insertOne(doc);
  return doc;
}

/**
 * ensurePlayerHasDefaultMachines(playerId, count)
 * - buat default machine bila belum ada
 */
export async function ensurePlayerHasDefaultMachines(playerId: string, count: number = 1) {
  const db = await getDb();
  const existing = await db.collection('machines').find({ ownerId: playerId }).limit(1).toArray();
  if (existing.length > 0) return; // sudah punya minimal 1

  const docs = [];
  for (let i = 1; i <= count; i++) {
    const doc = defaultMachineTemplate(playerId, i);
    docs.push(doc);
  }
  if (docs.length) await db.collection('machines').insertMany(docs);
  return docs;
}

/**
 * updateMachineState - partial update & returns new doc
 */
export async function updateMachineState(machineId: string, patch: any) {
  const db = await getDb();
  const res = await db.collection('machines').findOneAndUpdate(
    { id: machineId },
    {
      $set: { ...patch, updatedAt: new Date() },
      $setOnInsert: { id: machineId, createdAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' as const }
  );
  return res.value;
}

/**
 * createOrReplaceMachine - replace full doc
 */
export async function createOrReplaceMachine(machineDoc: any) {
  const db = await getDb();
  await db.collection('machines').replaceOne({ id: machineDoc.id }, { ...machineDoc, updatedAt: new Date() }, { upsert: true });
  return db.collection('machines').findOne({ id: machineDoc.id });
}
