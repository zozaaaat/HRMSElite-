import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import "dotenv/config";

// Use DATABASE_URL if set, otherwise default to dev.db
const dbPath = process.env.DATABASE_URL || "dev.db";
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
