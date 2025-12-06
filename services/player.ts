import { getDb } from '../lib/mongodb';

export async function getPlayerById(id: string) {
  const db = await getDb();
  return db.collection('players').findOne({ id });
}

export async function addGold(playerId: string, amount: number) {
  const db = await getDb();
  const res = await db.collection('players').findOneAndUpdate(
    { id: playerId },
    { $inc: { gold: amount }, $set: { updatedAt: new Date() } },
    { returnDocument: 'after', upsert: true }
  );
  return res.value;
}
