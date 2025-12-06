import { getDb } from '../lib/mongodb';

export async function getMachineById(id: string) {
  const db = await getDb();
  return db.collection('machines').findOne({ id });
}

export async function upsertMachine(machine: any) {
  const db = await getDb();
  await db.collection('machines').updateOne(
    { id: machine.id },
    { $set: { ...machine, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  return getMachineById(machine.id);
}
