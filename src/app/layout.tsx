import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/config";
import { getLocale } from "@/lib/tenancy";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "greek"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vyala.app"),
  title: {
    default: "Vyala, simple clinic management for Greece and Cyprus",
    template: "%s · Vyala",
  },
  description:
    "The calm way to run a medical practice. Patients, appointments, visit notes, payments and invoices in one clean bilingual workspace, built for doctors in Greece and Cyprus.",
  keywords: [
    "clinic management software",
    "medical practice management",
    "practice management software Greece",
    "clinic software Cyprus",
    "patient records software",
    "λογισμικό ιατρείου",
    "διαχείριση ιατρείου",
    "πρόγραμμα ιατρείου",
    "ηλεκτρονικός φάκελος ασθενή",
    "ραντεβού ιατρείου",
  ],
  openGraph: {
    title: "Vyala, simple clinic management",
    description:
      "Run your practice, not your paperwork. Patients, appointments, notes and payments in one calm place.",
    url: "/",
    siteName: "Vyala",
    locale: "en_GB",
    alternateLocale: ["el_GR"],
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vyala clinic management" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyala, simple clinic management",
    description:
      "Run your practice, not your paperwork. Patients, appointments, notes and payments in one calm place.",
    images: ["/og.png"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The locale cookie drives the app chrome; /el routes set their own lang via metadata.
  const locale = await getLocale();
  const page = (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
  return isClerkConfigured() ? <ClerkProvider>{page}</ClerkProvider> : page;
}
