/**
 * ReliefAI Production Structured Logger
 * 
 * Provides high-performance, structured JSON logging in production and formatted
 * human-readable logs in development. Automatically masks sensitive fields such as
 * passwords, JWTs, hashes, and API tokens to prevent credential leaks into log sinks.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'http';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  environment: string;
  service: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'secret',
  'jwt_secret',
  'jwt_access_secret',
  'jwt_refresh_secret',
  'api_key',
  'gemini_api_key',
  'openai_api_key',
  'database_url',
  'mongodb_uri',
  'cookie',
  'set-cookie',
]);

function sanitizeValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) return value;
  
  const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
  for (const sensitive of SENSITIVE_KEYS) {
    if (lowerKey.includes(sensitive.replace(/[-_]/g, ''))) {
      return '[REDACTED]';
    }
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((item, idx) => sanitizeValue(String(idx), item));
    }
    const cleanObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      cleanObj[k] = sanitizeValue(k, v);
    }
    return cleanObj;
  }

  return value;
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const timestamp = new Date().toISOString();

  const cleanMeta = meta ? (sanitizeValue('meta', meta) as Record<string, unknown>) : {};

  if (isProduction) {
    const entry: LogEntry = {
      timestamp,
      level,
      message,
      environment: process.env.NODE_ENV || 'production',
      service: 'reliefai-backend',
      ...cleanMeta,
    };
    return JSON.stringify(entry);
  }

  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const metaString = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(cleanMeta)}` : '';
  return `${prefix} ${message}${metaString}`;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      console.debug(formatLog('debug', message, meta));
    }
  },

  info(message: string, meta?: Record<string, unknown>) {
    console.info(formatLog('info', message, meta));
  },

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(formatLog('warn', message, meta));
  },

  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    const errMeta: Record<string, unknown> = { ...meta };
    if (error instanceof Error) {
      errMeta.errorName = error.name;
      errMeta.errorMessage = error.message;
      if (process.env.NODE_ENV !== 'production') {
        errMeta.stack = error.stack;
      }
    } else if (error) {
      errMeta.rawError = String(error);
    }
    console.error(formatLog('error', message, errMeta));
  },

  http(method: string, path: string, statusCode: number, latencyMs: number, meta?: Record<string, unknown>) {
    const message = `${method.toUpperCase()} ${path} ${statusCode} - ${latencyMs.toFixed(1)}ms`;
    const httpMeta = {
      httpMethod: method,
      httpPath: path,
      statusCode,
      latencyMs: Number(latencyMs.toFixed(1)),
      ...meta,
    };
    if (statusCode >= 500) {
      console.error(formatLog('http', message, httpMeta));
    } else if (statusCode >= 400) {
      console.warn(formatLog('http', message, httpMeta));
    } else {
      console.info(formatLog('http', message, httpMeta));
    }
  },
};
