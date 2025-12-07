// services/machine.ts
import { getDb } from '../lib/mongodb';

/* ===========================
   BASE HELPERS (VERSI LAMA)
=========================== */

export async function getMachineById(id: string) {
  const db = await getDb();
  return db.collection('machines').findOne({ id });
}

export async function updateMachine(id: string, patch: any) {
  const db = await getDb();
  const now = new Date();
  await db.collection('machines').updateOne(
    { id },
    { $set: { ...patch, updatedAt: now } }
  );
  return db.collection('machines').findOne({ id });
}

export async function createOrReplaceMachine(doc: any) {
  const db = await getDb();
  const now = new Date();
  await db.collection('machines').updateOne(
    { id: doc.id },
    { $set: { ...doc, updatedAt: now, createdAt: doc.createdAt ?? now } },
    { upsert: true }
  );
  return db.collection('machines').findOne({ id: doc.id });
}

/* ===========================
   ENGINE LIFECYCLE FUNCS (BARU)
=========================== */

// alias biar engine life-cycle nggak error
export const getMachineFromService = getMachineById;

// compute how much progress machine has
export function computeStatus(machine: any) {
  const now = Date.now();
  const duration = machine?.durationSec ?? 3600;
  const baseRate = machine?.baseRate ?? 0.5;

  let elapsed = 0;
  let complete = false;

  if (machine?.running && machine?.startAt) {
    elapsed = Math.max(0, Math.floor((now - machine.startAt) / 1000));
    complete = elapsed >= duration;
  }

  return {
    running: !!machine?.running,
    duration,
    elapsed,
    complete,
    effectiveRate: baseRate,
  };
}

export async function startMachine(id: string) {
  const startAt = Date.now();
  return updateMachine(id, { running: true, startAt });
}

export async function stopMachine(id: string) {
  return updateMachine(id, { running: false });
}

export async function repairMachine(id: string) {
  return updateMachine(id, { healthPct: 100 });
}

export function claimMachineRewards(machine: any) {
  const now = Date.now();
  const duration = machine?.durationSec ?? 3600;

  if (!machine.running || !machine.startAt)
    return { success: false, error: "not running" };

  const elapsed = Math.max(0, Math.floor((now - machine.startAt) / 1000));
  const complete = elapsed >= duration;

  if (!complete)
    return { success: false, error: "incomplete" };

  const reward = Math.floor((machine?.baseRate ?? 0.5) * duration);

  return { success: true, reward };
}
