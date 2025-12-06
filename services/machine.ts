import { getDb } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

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
