import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { termsEl } from "@/lib/legal-el";

export const metadata: Metadata = {
  title: "Όροι χρήσης",
  description: "Οι όροι που καλύπτουν τη χρήση του λογισμικού διαχείρισης ιατρείου Vyala.",
  alternates: { canonical: "/el/terms", languages: { en: "/terms", el: "/el/terms" } },
  openGraph: {
    title: "Όροι χρήσης Vyala",
    description: "Οι όροι που καλύπτουν τη χρήση του Vyala.",
    url: "/el/terms",
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
      doc={termsEl}
      locale="el"
      altHref="/terms"
      altLabel="EN"
      backLabel="Πίσω στον ιστότοπο"
    />
  );
}
