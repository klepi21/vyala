import "server-only";
import { notFound } from "next/navigation";
import { clean, db, isDbConfigured } from "./mongo";
import { getDict } from "./i18n";
import { getLocale } from "./tenancy";
import type { Clinic } from "./types";
import type { ObjectId } from "mongodb";

/**
 * The public showroom at /demo.
 *
 * It is deliberately unauthenticated, and safe because it can only ever
 * resolve the single seeded practice flagged `isDemo: true`. Real practices go
 * through requireClinic() and Clerk instead. Visitors can use the real forms,
 * because everything here is invented and demoReset() puts it back.
 */
export async function demoContext() {
  const clinic = await demoClinic();
  if (!clinic) notFound();
  const locale = await getLocale();
  return { clinic, locale, t: getDict(locale) };
}

/**
 * Resolve the demo practice, or null if the database is unset or unreachable.
 *
 * A visitor landing on the showroom should never meet a stack trace because
 * the database is down or an IP allowlist has not been opened, so the failure
 * is returned rather than thrown and the page explains itself.
 */
export async function demoClinic(): Promise<Clinic | null> {
  if (!isDbConfigured()) return null;
  try {
    const d = await db();
    const doc = await d.collection("clinics").findOne({ isDemo: true });
    return doc ? (clean(doc) as unknown as Clinic) : null;
  } catch {
    return null;
  }
}

/** The demo clinic's raw id, for writes that must never accept one from the caller. */
export async function demoClinicId(): Promise<ObjectId> {
  const d = await db();
  const clinicDoc = await d.collection("clinics").findOne({ isDemo: true }, { projection: { _id: 1 } });
  if (!clinicDoc) notFound();
  return clinicDoc._id;
}
