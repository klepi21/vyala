import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";
import { landingEl } from "@/lib/landing-copy";

export const metadata: Metadata = {
  title: "Κλείστε επίδειξη",
  description:
    "Πείτε μας για το ιατρείο σας και θα σας δείξουμε πώς θα δούλευε το Vyala για εσάς. Κουβέντα 15 λεπτών, χωρίς κάρτα και χωρίς δέσμευση.",
  alternates: { canonical: "/el/contact", languages: { en: "/contact", el: "/el/contact" } },
  openGraph: {
    title: "Κλείστε επίδειξη του Vyala",
    description: "Κουβέντα 15 λεπτών για το ιατρείο σας. Χωρίς κάρτα, χωρίς δέσμευση.",
    url: "/el/contact",
    siteName: "Vyala",
    locale: "el_GR",
    alternateLocale: ["en_GB"],
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vyala" }],
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  return <ContactPage c={landingEl} sent={sent === "1"} />;
}
