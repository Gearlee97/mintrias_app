import { getDb } from '../lib/mongodb';

export async function updateMachineState(machineId: string, newState: any) {
  const db = await getDb();
  const machines = db.collection('machines');

  const res = await machines.findOneAndUpdate(
    { id: machineId },
    {
      $set: { ...newState, updatedAt: new Date() },
      $setOnInsert: { id: machineId, createdAt: new Date() }
    },
    { upsert: true, returnDocument: 'after' }
  );

  return res.value;
}

export async function getMachine(machineId: string) {
  const db = await getDb();
  return db.collection('machines').findOne({ id: machineId });
}
