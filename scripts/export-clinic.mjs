/**
 * Export everything a practice holds, as JSON plus CSVs.
 *
 *   npm run export -- <clinic-slug> [outputDir]
 *
 * The Terms promise a full export on request; this is how that promise is
 * kept without hand-writing queries each time.
 */
import { MongoClient } from "mongodb";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const uri = process.env.MONGODB_URI;
const [slug, outDirArg] = process.argv.slice(2);
if (!uri || !slug) {
  console.error("Usage: npm run export -- <clinic-slug> [outputDir]");
  process.exit(1);
}

const csv = (rows) => {
  if (!rows.length) return "";
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const cell = (v) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
};

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "vyala");

const clinic = await db.collection("clinics").findOne({ slug });
if (!clinic) {
  console.error(`No practice with slug "${slug}".`);
  await client.close();
  process.exit(1);
}

const outDir = outDirArg ?? `./export-${slug}-${new Date().toISOString().slice(0, 10)}`;
await mkdir(outDir, { recursive: true });

const collections = [
  "members", "patients", "appointments", "visits", "payments", "invoices", "expenses", "documents",
];
const bundle = { clinic, exportedAt: new Date().toISOString() };

for (const name of collections) {
  const rows = await db.collection(name).find({ clinicId: clinic._id }).toArray();
  bundle[name] = rows;
  await writeFile(join(outDir, `${name}.csv`), csv(rows), "utf8");
  console.log(`  ${name.padEnd(14)} ${rows.length}`);
}

await writeFile(join(outDir, "everything.json"), JSON.stringify(bundle, null, 2), "utf8");
console.log(`\nWritten to ${outDir}`);
console.log("Document files themselves stay in GridFS and are downloaded from the app.");
await client.close();
