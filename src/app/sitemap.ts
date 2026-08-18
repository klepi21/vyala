import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://vyala.app";
  const paths = ["", "/el", "/demo", "/contact", "/el/contact", "/privacy", "/el/privacy",
    "/terms", "/el/terms", "/gdpr", "/el/gdpr"];
  return paths.map((p) => ({
    url: `${base}${p || "/"}`,
    changeFrequency: p.includes("privacy") || p.includes("terms") || p.includes("gdpr")
      ? "yearly" as const
      : "weekly" as const,
    priority: p === "" ? 1 : p === "/el" ? 0.9 : p === "/demo" ? 0.85 : p.includes("contact") ? 0.8 : 0.3,
  }));
}
