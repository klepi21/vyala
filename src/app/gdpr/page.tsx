import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { gdprEn } from "@/lib/legal-en";

export const metadata: Metadata = {
  title: "GDPR and data protection",
  description: "How Vyala meets GDPR obligations for special category medical data.",
  alternates: { canonical: "/gdpr", languages: { en: "/gdpr", el: "/el/gdpr" } },
  openGraph: {
    title: "Vyala GDPR and data protection",
    description: "How Vyala meets GDPR duties for medical data.",
    url: "/gdpr",
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
      doc={gdprEn}
      locale="en"
      altHref="/el/gdpr"
      altLabel="ΕΛ"
      backLabel="Back to site"
    />
  );
}
