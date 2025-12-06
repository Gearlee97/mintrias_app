import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'mintrias_app';

if (!uri) {
  throw new Error('MONGODB_URI not set');
}

// simple global client to avoid multiple connections in dev/hot-reload
declare global {
  // allow global var in Nodejs dev
  // eslint-disable-next-line no-var
  var __mongoClientPromise__: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!global.__mongoClientPromise__) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  global.__mongoClientPromise__ = clientPromise;
} else {
  clientPromise = global.__mongoClientPromise__!;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
