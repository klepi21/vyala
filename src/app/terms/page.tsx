import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { termsEn } from "@/lib/legal-en";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that cover your use of Vyala clinic management software.",
  alternates: { canonical: "/terms", languages: { en: "/terms", el: "/el/terms" } },
  openGraph: {
    title: "Vyala terms of service",
    description: "The terms covering your use of Vyala.",
    url: "/terms",
    siteName: "Vyala",
    locale: "en_GB",
    alternateLocale: ["el_GR"],
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vyala" }],
  },
};

export default function Page() {
  return (
    <LegalPage
      doc={termsEn}
      locale="en"
      altHref="/el/terms"
      altLabel="ΕΛ"
      backLabel="Back to site"
    />
  );
}
