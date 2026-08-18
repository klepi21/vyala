import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";
import { landingEn } from "@/lib/landing-copy";

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "Tell us about your practice and we will show you how Vyala would work for you. A 15 minute conversation, no card and no commitment.",
  alternates: { canonical: "/contact", languages: { en: "/contact", el: "/el/contact" } },
  openGraph: {
    title: "Book a demo of Vyala",
    description: "A 15 minute conversation about your practice. No card, no commitment.",
    url: "/contact",
    siteName: "Vyala",
    locale: "en_GB",
    alternateLocale: ["el_GR"],
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
  return <ContactPage c={landingEn} sent={sent === "1"} />;
}
