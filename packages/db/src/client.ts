import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lingua_db';

// For queries
export const queryClient = postgres(connectionString, {
  max: Number(process.env.DB_MAX_CONNECTIONS) || 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
