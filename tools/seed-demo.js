/**
 * tools/seed-demo.js
 * Usage:
 *  - node tools/seed-demo.js --create-indexes
 *  - node tools/seed-demo.js --seed-demo
 *
 * This file WILL NOT run automatically. Run only when you want to seed.
 */
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mintrias_app';

if (!uri) {
  console.error('MONGODB_URI not set in env. Aborting.');
  process.exit(1);
}

async function createIndexes() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log('Creating indexes...');
  await db.collection('players').createIndex({ id: 1 }, { unique: true });
  await db.collection('machines').createIndex({ id: 1 }, { unique: true });
  await db.collection('machines').createIndex({ ownerId: 1 });
  console.log('Indexes created.');
  await client.close();
}

async function seedDemo() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const playerId = 'player-demo';
  const machineId = playerId + '-m1';

  console.log('Seeding demo player & machine...');
  await db.collection('players').updateOne(
    { id: playerId },
    { $set: { id: playerId, gold: 10000, createdAt: new Date(), updatedAt: new Date() } },
    { upsert: true }
  );

  await db.collection('machines').updateOne(
    { id: machineId },
    {
      $set: {
        id: machineId,
        ownerId: playerId,
        baseRate: 0.5,
        durationSec: 3600,
        healthPct: 100,
        running: false,
        progressSec: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );

  console.log('Seed done.');
  await client.close();
}

(async () => {
  const arg = process.argv[2];
  if (arg === '--create-indexes') {
    await createIndexes();
    process.exit(0);
  } else if (arg === '--seed-demo') {
    await seedDemo();
    process.exit(0);
  } else {
    console.log('No action. Use --create-indexes or --seed-demo');
    process.exit(0);
  }
})();
