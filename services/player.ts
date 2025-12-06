import { getDb } from '../lib/mongodb';

export async function addPlayerBalance(playerId: string, amount: number) {
  const db = await getDb();
  const players = db.collection('players');

  const res = await players.findOneAndUpdate(
    { id: playerId },
    {
      $inc: { gold: amount },
      $setOnInsert: { id: playerId, createdAt: new Date(), gold: 0 },
      $set: { updatedAt: new Date() }
    },
    { upsert: true, returnDocument: 'after' }
  );

  return res.value;
}

export async function getPlayer(playerId: string) {
  const db = await getDb();
  return db.collection('players').findOne({ id: playerId });
}
