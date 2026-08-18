import type { Metadata } from "next";
import { Landing } from "@/components/Landing";
import { landingEn } from "@/lib/landing-copy";

export const metadata: Metadata = {
  title: "Vyala, simple clinic management software for Greece and Cyprus",
  description:
    "The calm way to run a medical practice. Patients, appointments, visit notes, payments and invoices in one clean bilingual tool. Book a 15 minute demo.",
  alternates: { canonical: "/", languages: { en: "/", el: "/el" } },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Vyala",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Simple clinic and medical practice management software for Greece and Cyprus: patients, appointments, visit notes, payments and invoices.",
    inLanguage: ["en", "el"],
    offers: { "@type": "Offer", availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Landing c={landingEn} />
    </>
  );
}
