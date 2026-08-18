import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { privacyEn } from "@/lib/legal-en";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Vyala handles your data and your patients data, in plain language.",
  alternates: { canonical: "/privacy", languages: { en: "/privacy", el: "/el/privacy" } },
  openGraph: {
    title: "Vyala privacy policy",
    description: "How we handle your data and your patients data.",
    url: "/privacy",
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
      doc={privacyEn}
      locale="en"
      altHref="/el/privacy"
      altLabel="ΕΛ"
      backLabel="Back to site"
    />
  );
}
