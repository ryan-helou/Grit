import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// `db` is null in demo mode (no DATABASE_URL). Callers guard with `if (!db)`.
const url = process.env.DATABASE_URL;

export const db = url ? drizzle(neon(url), { schema }) : null;
export { schema };
