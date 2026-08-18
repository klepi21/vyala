import "server-only";
import { MongoClient, Db, GridFSBucket, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB || "vyala";

export function isDbConfigured(): boolean {
  return uri.startsWith("mongodb") && !uri.includes("xxxx");
}

// Reuse the client across hot reloads in dev so we do not exhaust connections.
const globalForMongo = globalThis as unknown as { _vyalaMongo?: Promise<MongoClient> };

function clientPromise(): Promise<MongoClient> {
  if (!globalForMongo._vyalaMongo) {
    globalForMongo._vyalaMongo = new MongoClient(uri, { maxPoolSize: 10 }).connect();
  }
  return globalForMongo._vyalaMongo;
}

export async function db(): Promise<Db> {
  const client = await clientPromise();
  return client.db(dbName);
}

export async function bucket(): Promise<GridFSBucket> {
  return new GridFSBucket(await db(), { bucketName: "documents" });
}

export const oid = (id: string) => new ObjectId(id);
export const isValidId = (id: string) => ObjectId.isValid(id);

/** Convert Mongo _id (and any nested ids) into plain string `id` fields for React. */
export function clean<T extends Record<string, unknown>>(doc: T | null): (Omit<T, "_id"> & { id: string }) | null {
  if (!doc) return null;
  const { _id, ...rest } = doc as Record<string, unknown>;
  const out: Record<string, unknown> = { id: String(_id) };
  for (const [k, v] of Object.entries(rest)) {
    out[k] = v instanceof ObjectId ? String(v) : v;
  }
  return out as Omit<T, "_id"> & { id: string };
}

export function cleanAll<T extends Record<string, unknown>>(docs: T[]): (Omit<T, "_id"> & { id: string })[] {
  return docs.map((d) => clean(d)!).filter(Boolean);
}

/** Create the indexes the app relies on. Safe to call repeatedly. */
export async function ensureIndexes(): Promise<void> {
  const d = await db();
  await Promise.all([
    d.collection("clinics").createIndex({ slug: 1 }, { unique: true }),
    d.collection("members").createIndex({ clinicId: 1, email: 1 }, { unique: true }),
    d.collection("members").createIndex({ clerkUserId: 1 }),
    d.collection("patients").createIndex({ clinicId: 1, lastName: 1, firstName: 1 }),
    d.collection("appointments").createIndex({ clinicId: 1, startsAt: 1 }),
    d.collection("visits").createIndex({ patientId: 1, visitDate: -1 }),
    d.collection("payments").createIndex({ clinicId: 1, paidAt: -1 }),
    d.collection("invoices").createIndex({ clinicId: 1, number: 1 }, { unique: true }),
    d.collection("documents").createIndex({ patientId: 1, createdAt: -1 }),
    d.collection("leads").createIndex({ createdAt: -1 }),
    d.collection("expenses").createIndex({ clinicId: 1, spentAt: -1 }),
    d.collection("patients").createIndex({ clinicId: 1, amka: 1 }),
  ]);
}
