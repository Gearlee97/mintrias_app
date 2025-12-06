/**
 * services/player.ts
 * Player helpers: get, create, upsert, and balance ops.
 */
import { getDb } from '../lib/mongodb';

export type PlayerDoc = {
  id: string;
  username?: string | null;
  gold: number;
  lab?: any;
  machines?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function getPlayer(playerId: string): Promise<PlayerDoc | null> {
  const db = await getDb();
  return db.collection('players').findOne({ id: playerId }) as Promise<PlayerDoc | null>;
}

export async function createPlayer(playerId: string, seed: Partial<PlayerDoc> = {}) {
  const db = await getDb();
  const doc = {
    id: playerId,
    gold: 0,
    machines: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...seed,
  };
  await db.collection('players').insertOne(doc);
  return doc;
}

/**
 * ensurePlayer: return player doc; create if missing
 */
export async function ensurePlayer(playerId: string, seed: Partial<PlayerDoc> = {}) {
  const p = await getPlayer(playerId);
  if (p) return p;
  return createPlayer(playerId, seed);
}

/**
 * addPlayerGold: atomically increment player's gold (can be negative)
 */
export async function addPlayerGold(playerId: string, amount: number) {
  const db = await getDb();
  const res = await db.collection('players').findOneAndUpdate(
    { id: playerId },
    {
      $inc: { gold: amount },
      $setOnInsert: { id: playerId, createdAt: new Date() },
      $set: { updatedAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' as const }
  );
  return res.value as PlayerDoc;
}

/**
 * setPlayerGold: set player's gold to exact value
 */
export async function setPlayerGold(playerId: string, amount: number) {
  const db = await getDb();
  const res = await db.collection('players').findOneAndUpdate(
    { id: playerId },
    { $set: { gold: amount, updatedAt: new Date() }, $setOnInsert: { id: playerId, createdAt: new Date() } },
    { upsert: true, returnDocument: 'after' as const }
  );
  return res.value as PlayerDoc;
}
