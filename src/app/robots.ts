import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/el", "/contact", "/privacy", "/terms", "/gdpr", "/demo"],
        disallow: ["/c/", "/app", "/onboarding", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: "https://vyala.app/sitemap.xml",
  };
}
