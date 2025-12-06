import { MongoClient, Db } from 'mongodb';

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
  var __mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI ?? '';
const dbName = process.env.MONGODB_DB ?? '';

if (!uri) {
  throw new Error('MONGODB_URI is required');
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global.__mongoClientPromise) {
    const client = new MongoClient(uri);
    global.__mongoClient = client;
    global.__mongoClientPromise = client.connect();
  }
  clientPromise = global.__mongoClientPromise!;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName || undefined);
}
