import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { clean, cleanAll, db, oid } from "./mongo";
import { getDict, normalizeLocale, type Dict, type Locale } from "./i18n";
import type { Clinic, Member } from "./types";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get("vyala_locale")?.value);
}

export interface ClinicContext {
  clinic: Clinic;
  member: Member;
  locale: Locale;
  t: Dict;
}

/**
 * Resolve the signed-in user's membership for the clinic at /c/[slug].
 * A member added by email is linked to their Clerk account the first time
 * they open the clinic, so no invite emails are needed.
 */
export async function requireClinic(slug: string): Promise<ClinicContext> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const d = await db();
  const clinicDoc = await d.collection("clinics").findOne({ slug });
  if (!clinicDoc) notFound();
  const clinic = clean(clinicDoc) as unknown as Clinic;

  let memberDoc = await d
    .collection("members")
    .findOne({ clinicId: oid(clinic.id), clerkUserId: userId });

  if (!memberDoc) {
    const user = await currentUser();
    const emails = (user?.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
    if (emails.length > 0) {
      memberDoc = await d.collection("members").findOneAndUpdate(
        { clinicId: oid(clinic.id), clerkUserId: null, email: { $in: emails } },
        { $set: { clerkUserId: userId } },
        { returnDocument: "after" }
      );
    }
  }

  if (!memberDoc) redirect("/app");

  const locale = await getLocale();
  return {
    clinic,
    member: clean(memberDoc) as unknown as Member,
    locale,
    t: getDict(locale),
  };
}

/** Every clinic the signed-in user belongs to, linking pending invites by email. */
export async function myClinics(): Promise<{ clinic: Clinic; member: Member }[]> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const d = await db();
  const user = await currentUser();
  const emails = (user?.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());

  if (emails.length > 0) {
    await d
      .collection("members")
      .updateMany({ clerkUserId: null, email: { $in: emails } }, { $set: { clerkUserId: userId } });
  }

  const members = cleanAll(
    await d.collection("members").find({ clerkUserId: userId }).toArray()
  ) as unknown as Member[];
  if (members.length === 0) return [];

  const clinics = cleanAll(
    await d
      .collection("clinics")
      .find({ _id: { $in: members.map((m) => oid(m.clinicId)) } })
      .toArray()
  ) as unknown as Clinic[];

  const byId = new Map(clinics.map((c) => [c.id, c]));
  return members
    .map((m) => ({ clinic: byId.get(m.clinicId)!, member: m }))
    .filter((r) => r.clinic);
}

export function slugify(name: string): string {
  const map: Record<string, string> = {
    α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th", ι: "i",
    κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p", ρ: "r", σ: "s",
    ς: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps", ω: "o",
    ά: "a", έ: "e", ή: "i", ί: "i", ό: "o", ύ: "y", ώ: "o", ϊ: "i", ϋ: "y", ΐ: "i", ΰ: "y",
  };
  return (
    name
      .toLowerCase()
      .split("")
      .map((c) => map[c] ?? c)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "clinic"
  );
}
