const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  const dbName = process.env.MONGODB_DB || 'asg_analytics';

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
  });
  await client.connect();
  const db = client.db(dbName);

  // Basic indexes (created once)
  await Promise.all([
    db.collection('events').createIndex({ ts: 1 }),
    db.collection('events').createIndex({ 'meta.sessionId': 1, ts: 1 }),
    db.collection('events').createIndex({ type: 1, ts: 1 }),
  ]).catch(() => {});

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

module.exports = { connectToDatabase };



