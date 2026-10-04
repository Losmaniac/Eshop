import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "@/server/config";

// libSQL works with a local SQLite file (self-hosting, development) and with
// a hosted Turso database (serverless hosts). Set DATABASE_URL accordingly.

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    total INTEGER NOT NULL,
    data TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    data TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS inquiry_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiry_id INTEGER NOT NULL REFERENCES inquiries(id),
    token TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    size INTEGER NOT NULL,
    content BLOB NOT NULL
  )`,
];

let client: Client | undefined;
let ready: Promise<void> | undefined;

export async function db(): Promise<Client> {
  if (!client) {
    const url = config.databaseUrl;
    if (url.startsWith("file:")) {
      mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
    }
    client = createClient({ url, authToken: config.databaseAuthToken || undefined });
    ready = client.batch(SCHEMA, "write").then(() => undefined);
  }
  await ready;
  return client;
}
