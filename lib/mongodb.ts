import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mintrias_app';

if (!uri) {
  throw new Error('MONGODB_URI not set in env');
}

// use globalThis to cache client in dev (prevent multiple connections)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await clientPromise;
  return c.db(dbName);
}
