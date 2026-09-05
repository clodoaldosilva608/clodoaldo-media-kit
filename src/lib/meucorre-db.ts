import pg from "pg";

/**
 * Shared connection pool for the meucorre Supabase database.
 * Used by: prospects, envios, respostas, prospect/report APIs.
 *
 * Connection string MUST be provided via MEUCORRE_DATABASE_URL env var.
 * Never hardcode credentials in source.
 */
const connectionString = process.env.MEUCORRE_DATABASE_URL;

let _pool: pg.Pool | null = null;

export function getMeucorrePool(): pg.Pool {
  if (_pool) return _pool;
  if (!connectionString) {
    throw new Error("MEUCORRE_DATABASE_URL env var is required in production");
  }
  _pool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  return _pool;
}

/**
 * The meucorre admin JWT used for the Google Maps proxy.
 * Read from env var, never hardcoded.
 */
export function getMeucorreJwt(): string {
  const jwt = process.env.MEUCORRE_ADMIN_JWT;
  if (!jwt) {
    throw new Error("MEUCORRE_ADMIN_JWT env var is required");
  }
  return jwt;
}
