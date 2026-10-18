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

const MONGODB_URI = process.env.MONGODB_URI;

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export class DatabaseUnavailableError extends Error {
  readonly status = 503;
  readonly statusCode = 503;
  readonly code = 'DATABASE_UNAVAILABLE';
  constructor(message: string = 'Database service is currently unavailable. Please try again shortly.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

export function isDatabaseUnavailableError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof DatabaseUnavailableError) return true;
  if (typeof err === 'object' && ('code' in err && (err as any).code === 'DATABASE_UNAVAILABLE' || 'status' in err && (err as any).status === 503)) return true;
  if (err instanceof Error && (err.name === 'DatabaseUnavailableError' || err.message.includes('DATABASE_UNAVAILABLE') || err.message.includes('MONGODB_URI is required'))) return true;
  return false;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isMongoConfigured()) {
    if (isProduction) {
      throw new DatabaseUnavailableError('FATAL: MONGODB_URI is required and cannot be empty in production.');
    }
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const activeUri = process.env.MONGODB_URI?.trim();
    if (!activeUri) {
      if (isProduction) {
        throw new DatabaseUnavailableError('FATAL: MONGODB_URI is required in production.');
      }
      return null;
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(activeUri, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        console.error('[ReliefAI MongoDB Connection Error]:', err.message || 'Connection failed');
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
      if (e instanceof DatabaseUnavailableError) throw e;
      throw new DatabaseUnavailableError('Database service is currently unavailable. Please try again shortly.');
    }
    throw e;
  }
}
