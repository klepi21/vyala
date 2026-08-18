import "server-only";
import { notFound } from "next/navigation";
import { clean, db } from "./mongo";
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
  const d = await db();
  const clinicDoc = await d.collection("clinics").findOne({ isDemo: true });
  if (!clinicDoc) notFound();
  const locale = await getLocale();
  return {
    clinic: clean(clinicDoc) as unknown as Clinic,
    locale,
    t: getDict(locale),
  };
}

/** The demo clinic's raw id, for writes that must never accept one from the caller. */
export async function demoClinicId(): Promise<ObjectId> {
  const d = await db();
  const clinicDoc = await d.collection("clinics").findOne({ isDemo: true }, { projection: { _id: 1 } });
  if (!clinicDoc) notFound();
  return clinicDoc._id;
}
