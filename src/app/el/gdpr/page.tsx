import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { gdprEl } from "@/lib/legal-el";

export const metadata: Metadata = {
  title: "GDPR και προστασία δεδομένων",
  description: "Πώς το Vyala καλύπτει τις υποχρεώσεις GDPR για ιατρικά δεδομένα ειδικής κατηγορίας.",
  alternates: { canonical: "/el/gdpr", languages: { en: "/gdpr", el: "/el/gdpr" } },
  openGraph: {
    title: "GDPR και προστασία δεδομένων Vyala",
    description: "Πώς καλύπτει το Vyala τις υποχρεώσεις GDPR για ιατρικά δεδομένα.",
    url: "/el/gdpr",
    siteName: "Vyala",
    locale: "el_GR",
    alternateLocale: ["en_GB"],
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vyala" }],
  },
};

export default function Page() {
  return (
    <LegalPage
      doc={gdprEl}
      locale="el"
      altHref="/gdpr"
      altLabel="EN"
      backLabel="Πίσω στον ιστότοπο"
    />
  );
}
