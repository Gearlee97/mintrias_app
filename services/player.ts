import { getDb } from '../lib/mongodb';

export async function getPlayerById(id: string) {
  const db = await getDb();
  return db.collection('players').findOne({ id });
}

export async function upsertPlayer(player: any) {
  const db = await getDb();
  await db.collection('players').updateOne(
    { id: player.id },
    { $set: { ...player, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  return getPlayerById(player.id);
}

export async function changePlayerGold(id: string, delta: number) {
  const db = await getDb();
  const res = await db.collection('players').findOneAndUpdate(
    { id },
    { $inc: { gold: delta }, $set: { updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return res.value;
}
