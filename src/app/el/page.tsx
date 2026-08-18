import type { Metadata } from "next";
import { Landing } from "@/components/Landing";
import { landingEl } from "@/lib/landing-copy";

export const metadata: Metadata = {
  title: "Vyala, απλό πρόγραμμα διαχείρισης ιατρείου για Ελλάδα και Κύπρο",
  description:
    "Ο ήρεμος τρόπος να τρέχετε το ιατρείο σας. Ασθενείς, ραντεβού, σημειώσεις επίσκεψης, πληρωμές και αποδείξεις σε ένα καθαρό δίγλωσσο εργαλείο. Κλείστε επίδειξη 15 λεπτών.",
  alternates: { canonical: "/el", languages: { en: "/", el: "/el" } },
  openGraph: {
    title: "Vyala, απλό πρόγραμμα διαχείρισης ιατρείου",
    description: "Ασθενείς, ραντεβού, σημειώσεις επίσκεψης και πληρωμές σε ένα ήρεμο μέρος.",
    url: "/el",
    siteName: "Vyala",
    locale: "el_GR",
    alternateLocale: ["en_GB"],
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vyala" }],
  },
};

export default function HomeElPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Vyala",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Απλό λογισμικό διαχείρισης ιατρείου για Ελλάδα και Κύπρο: ασθενείς, ραντεβού, σημειώσεις επίσκεψης, πληρωμές και αποδείξεις.",
    inLanguage: ["el", "en"],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Landing c={landingEl} />
    </>
  );
}
