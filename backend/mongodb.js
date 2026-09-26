import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory first, then root if needed
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'spendwise';

let client = null;
let db = null;
let isConnected = false;
let lastSyncTime = null;
let lastError = null;
let isSyncing = false;

const COLLECTIONS = [
  'accounts',
  'transactions',
  'budgets',
  'goals',
  'recurring',
  'salary',
  'notifications',
  'users'
];

/**
 * Initialize MongoDB connection and verify cluster connectivity
 */
export async function initMongoDB() {
  if (!MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI not specified. Using local atomic storage.');
    return { connected: false, reason: 'MONGODB_URI missing' };
  }

  try {
    const maskedUri = MONGODB_URI.replace(/:[^:]*@/, ':****@');
    console.log(`🔌 Connecting to MongoDB Atlas cluster at ${maskedUri}...`);

    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    db = client.db(DB_NAME);

    // Verify with ping
    await db.command({ ping: 1 });
    isConnected = true;
    lastError = null;
    console.log(`✅ MongoDB Atlas connected successfully to database "${DB_NAME}"!`);

    return { connected: true, db };
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn(`⚠️ Failed to connect to MongoDB Atlas (${err.message}). SpendWise will operate seamlessly with local persistence.`);
    return { connected: false, error: err.message };
  }
}

/**
 * Load initial state from MongoDB Atlas if available, or seed Atlas with initialData
 */
export async function syncOnStartup(fallbackData) {
  if (!isConnected || !db) return fallbackData;

  try {
    // Check if transactions collection has any data
    const txCount = await db.collection('transactions').countDocuments();
    const accCount = await db.collection('accounts').countDocuments();

    if (txCount === 0 && accCount === 0) {
      console.log('🌱 MongoDB Atlas is empty. Seeding MongoDB Atlas with initial data...');
      await saveAllToMongoDB(fallbackData);
      return fallbackData;
    }

    console.log(`📥 Loading existing dataset from MongoDB Atlas (${txCount} transactions, ${accCount} accounts)...`);
    const loadedData = {
      settings: fallbackData.settings,
      salary: [],
      accounts: [],
      transactions: [],
      budgets: [],
      goals: [],
      recurring: [],
      notifications: [],
      users: []
    };

    for (const colName of COLLECTIONS) {
      const items = await db.collection(colName).find({}, { projection: { _id: 0 } }).toArray();
      loadedData[colName] = items;
    }

    const settingsDoc = await db.collection('settings').findOne({ _id: 'app_settings' }, { projection: { _id: 0 } });
    if (settingsDoc) {
      loadedData.settings = settingsDoc;
    }

    lastSyncTime = new Date().toISOString();
    console.log('✅ Synchronized state from MongoDB Atlas cloud database.');
    return loadedData;
  } catch (err) {
    console.error('❌ Error synchronizing from MongoDB Atlas on startup:', err.message);
    return fallbackData;
  }
}

let pendingSyncData = null;

/**
 * Persist current state to MongoDB Atlas cloud database in the background
 */
export async function saveAllToMongoDB(data) {
  if (!isConnected || !db) return;

  if (isSyncing) {
    pendingSyncData = data;
    return;
  }

  isSyncing = true;
  try {
    let currentData = data;
    while (currentData) {
      pendingSyncData = null;

      // Upsert collections
      for (const colName of COLLECTIONS) {
        const items = currentData[colName] || [];
        const col = db.collection(colName);

        if (items.length > 0) {
          const itemIds = items.map(i => i.id).filter(Boolean);
          const ops = items.map(item => ({
            updateOne: {
              filter: { id: item.id },
              update: { $set: item },
              upsert: true
            }
          }));

          await col.bulkWrite(ops, { ordered: false });

          // Clean up removed items if any
          if (itemIds.length > 0) {
            await col.deleteMany({ id: { $nin: itemIds } });
          }
        } else {
          await col.deleteMany({});
        }
      }

      // Upsert settings
      if (currentData.settings) {
        await db.collection('settings').updateOne(
          { _id: 'app_settings' },
          { $set: currentData.settings },
          { upsert: true }
        );
      }

      lastSyncTime = new Date().toISOString();
      lastError = null;

      // Check if another sync was queued while we were busy syncing
      currentData = pendingSyncData;
    }
  } catch (err) {
    lastError = err.message;
    console.error('⚠️ MongoDB Atlas background sync warning:', err.message);
  } finally {
    isSyncing = false;
  }
}

/**
 * Reset all MongoDB Atlas collections with fresh data
 */
export async function resetMongoDB(freshData) {
  if (!isConnected || !db) return;

  try {
    for (const colName of COLLECTIONS) {
      await db.collection(colName).deleteMany({});
      const items = freshData[colName] || [];
      if (items.length > 0) {
        await db.collection(colName).insertMany(structuredClone(items));
      }
    }
    if (freshData.settings) {
      await db.collection('settings').updateOne(
        { _id: 'app_settings' },
        { $set: freshData.settings },
        { upsert: true }
      );
    }
    lastSyncTime = new Date().toISOString();
    console.log('🔄 MongoDB Atlas database reset to clean seed state.');
  } catch (err) {
    console.error('Error resetting MongoDB Atlas:', err.message);
  }
}

/**
 * Telemetry and status report
 */
export async function getMongoDBStatus() {
  if (!isConnected || !db) {
    return {
      configured: Boolean(MONGODB_URI),
      connected: false,
      provider: 'Local JSON Store',
      dbName: DB_NAME,
      lastSync: lastSyncTime,
      error: lastError
    };
  }

  let counts = {};
  try {
    for (const col of COLLECTIONS) {
      counts[col] = await db.collection(col).countDocuments();
    }
  } catch (err) {
    counts = { error: err.message };
  }

  return {
    configured: true,
    connected: true,
    provider: 'MongoDB Atlas',
    cluster: 'cluster0.fcee7mp.mongodb.net',
    dbName: DB_NAME,
    collections: counts,
    lastSync: lastSyncTime,
    timestamp: new Date().toISOString()
  };
}
