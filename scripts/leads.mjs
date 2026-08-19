/**
 * Read the demo requests that have come in.
 *
 *   npm run leads              list everything still marked new
 *   npm run leads -- all       list every enquiry
 *   npm run leads -- done <id> mark one as handled
 *
 * Until outbound email is wired up this is how you work the pipeline.
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing. Run with: npm run leads");
  process.exit(1);
}

const [mode, id] = process.argv.slice(2);

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "vyala");
const leads = db.collection("leads");

if (mode === "done" && id) {
  const { ObjectId } = await import("mongodb");
  await leads.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "handled", handledAt: new Date().toISOString() } }
  );
  console.log(`Marked ${id} as handled.`);
} else {
  const filter = mode === "all" ? {} : { status: { $ne: "handled" } };
  const rows = await leads.find(filter).sort({ createdAt: -1 }).limit(100).toArray();

  if (rows.length === 0) {
    console.log(mode === "all" ? "No enquiries yet." : "Nothing new. Use `npm run leads -- all` to see handled ones.");
  } else {
    console.log(`\n${rows.length} enquir${rows.length === 1 ? "y" : "ies"}:\n`);
    for (const r of rows) {
      const when = new Date(r.createdAt).toLocaleString("en-GB", { timeZone: "Europe/Athens" });
      console.log(`  ${r.status === "handled" ? "[done]" : "[NEW] "} ${when}`);
      console.log(`  ${r.name}  <${r.email}>  ${r.phone ?? ""}`);
      console.log(`  ${r.clinicName ?? "practice not given"} · ${r.size ?? "size not given"} · ${r.locale ?? "en"}`);
      if (r.message) console.log(`  "${r.message}"`);
      console.log(`  id: ${r._id}\n`);
    }
  }
}

await client.close();
