import mongoose from 'mongoose';

/**
 * Global cache interface to prevent multiple connections
 * during Next.js serverless invocations and hot reloading.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

let listenersAttached = false;
function attachConnectionListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    console.log('[ReliefAI MongoDB] Connection established successfully.');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[ReliefAI MongoDB] Connection dropped. Resetting cached connection.');
    if (global.mongooseCache) {
      global.mongooseCache.conn = null;
      global.mongooseCache.promise = null;
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('[ReliefAI MongoDB] Underlying connection error:', err?.message || err);
    if (global.mongooseCache) {
      global.mongooseCache.conn = null;
      global.mongooseCache.promise = null;
    }
  });
}

export class DatabaseUnavailableError extends Error {
  readonly status = 503;
  readonly statusCode = 503;
  readonly code = 'DATABASE_UNAVAILABLE';
  constructor(message: string = 'Database service is currently unavailable. Please try again shortly.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
    Object.setPrototypeOf(this, DatabaseUnavailableError.prototype);
  }
}

export function isDatabaseUnavailableError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof DatabaseUnavailableError) return true;
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (obj.code === 'DATABASE_UNAVAILABLE' || obj.status === 503 || obj.statusCode === 503) return true;
    if (obj.name === 'DatabaseUnavailableError') return true;
    if (
      obj.name === 'MongoServerSelectionError' ||
      obj.name === 'MongooseServerSelectionError' ||
      obj.name === 'MongoNetworkError' ||
      obj.name === 'MongoTimeoutError' ||
      obj.name === 'MongoTopologyClosedError' ||
      obj.name === 'MongoNotConnectedError'
    ) {
      return true;
    }
  }
  if (err instanceof Error) {
    if (
      err.name === 'DatabaseUnavailableError' ||
      err.name === 'MongoServerSelectionError' ||
      err.name === 'MongooseServerSelectionError' ||
      err.name === 'MongoNetworkError' ||
      err.name === 'MongoTimeoutError' ||
      err.name === 'MongoTopologyClosedError' ||
      err.message.includes('DATABASE_UNAVAILABLE') ||
      err.message.includes('MONGODB_URI is required') ||
      err.message.includes('Could not connect to any servers in your MongoDB Atlas cluster') ||
      err.message.includes('buffering timed out') ||
      err.message.includes('Client must be connected before running operations')
    ) {
      return true;
    }
  }
  return false;
}

export function sanitizeMongoUri(uri: string): { sanitized: string; host: string; dbName: string } {
  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)(?:([^:]+):([^@]+)@)?([^/?#]+)(?:\/([^?#]+))?(?:\?(.*))?$/);
    if (!match) {
      return { sanitized: '[Invalid or non-standard URI]', host: 'unknown', dbName: 'unknown' };
    }
    const [, protocol, username, , host, dbName = 'reliefai'] = match;
    const userMask = username ? `${username}:***@` : '***:***@';
    const sanitized = `${protocol}${userMask}${host}/${dbName}`;
    return { sanitized, host, dbName };
  } catch {
    return { sanitized: '[URI Parsing Error]', host: 'unknown', dbName: 'unknown' };
  }
}

export function isMongoConfigured(): boolean {
  const uri = process.env.MONGODB_URI;
  return Boolean(uri && uri.trim().length > 0);
}

export function validateMongoConfig(): { valid: boolean; error?: string } {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    return { valid: false, error: 'MONGODB_URI environment variable is not configured or is empty.' };
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return { valid: false, error: 'MONGODB_URI must start with "mongodb://" or "mongodb+srv://".' };
  }
  return { valid: true };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const isProduction = process.env.NODE_ENV === 'production';
  const isConfigured = isMongoConfigured();

  if (!isConfigured) {
    if (isProduction) {
      console.error('[ReliefAI MongoDB Security Alert] MONGODB_URI is required and cannot be empty in production.');
      throw new DatabaseUnavailableError('FATAL: MONGODB_URI is required and cannot be empty in production.');
    }
    return null;
  }

  const activeUri = process.env.MONGODB_URI!.trim();
  const validation = validateMongoConfig();
  if (!validation.valid) {
    console.error('[ReliefAI MongoDB Security Alert]', validation.error);
    if (isProduction) {
      throw new DatabaseUnavailableError('FATAL: MONGODB_URI format is invalid.');
    }
    return null;
  }

  attachConnectionListeners();

  // 1. Return active connection if readyState is connected (1)
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If disconnected (0) or disconnecting (3), clear stale promises for clean reconnection
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  // 3. Initiate or reuse connection promise
  if (!cached.promise) {
    const { sanitized, host, dbName } = sanitizeMongoUri(activeUri);

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(activeUri, opts)
      .then((mongooseInstance) => {
        cached.conn = mongooseInstance;
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;

        const errName = err?.name || 'MongoError';
        const errMsg = err?.message || 'Connection failed';
        console.error(`[ReliefAI MongoDB Connection Error] Failed connecting to ${sanitized} (Host: ${host}, DB: ${dbName})`);
        console.error(`[ReliefAI MongoDB Diagnostic] ${errName}: ${errMsg}`);

        if (errMsg.includes('alert number 80') || errMsg.includes('tlsv1 alert internal error')) {
          console.error('[ReliefAI Atlas Diagnostic] TLS Alert 80: IP blocked by MongoDB Atlas Network Access IP Access List. Ensure 0.0.0.0/0 is added for Vercel serverless deployments.');
        } else if (errMsg.includes('bad auth') || errMsg.includes('Authentication failed')) {
          console.error('[ReliefAI Atlas Diagnostic] Authentication failed: Check database username and password in MongoDB Atlas Database Access.');
        } else if (errMsg.includes('querySrv ENOTFOUND') || errMsg.includes('ENOTFOUND')) {
          console.error('[ReliefAI Atlas Diagnostic] DNS resolution failed: Check the cluster hostname in MONGODB_URI.');
        }

        if (isProduction) {
          throw new DatabaseUnavailableError('Database service is currently unavailable. Persistent connection failed.');
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    if (isProduction) {
      if (isDatabaseUnavailableError(e)) throw e;
      throw new DatabaseUnavailableError('Database service is currently unavailable. Please try again shortly.');
    }
    throw e;
  }
}
