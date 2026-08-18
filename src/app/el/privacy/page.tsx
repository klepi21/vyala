import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { privacyEl } from "@/lib/legal-el";

export const metadata: Metadata = {
  title: "Πολιτική απορρήτου",
  description: "Πώς διαχειρίζεται το Vyala τα δικά σας δεδομένα και των ασθενών σας, σε απλά ελληνικά.",
  alternates: { canonical: "/el/privacy", languages: { en: "/privacy", el: "/el/privacy" } },
  openGraph: {
    title: "Πολιτική απορρήτου Vyala",
    description: "Πώς διαχειριζόμαστε τα δεδομένα σας και των ασθενών σας.",
    url: "/el/privacy",
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
      doc={privacyEl}
      locale="el"
      altHref="/privacy"
      altLabel="EN"
      backLabel="Πίσω στον ιστότοπο"
    />
  );
}
