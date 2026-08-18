const pk = () => process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const sk = () => process.env.CLERK_SECRET_KEY ?? "";

const looksReal = (v: string, prefix: string) =>
  v.startsWith(prefix) && v.length > 20 && !v.includes("xxxx") && !v.includes("placeholder");

/** The browser-side key. Enough to render Clerk's own sign-in widget. */
export function hasClerkPublishableKey(): boolean {
  return looksReal(pk(), "pk_") && !pk().includes("Y2xlcmsuZXhhbXBsZS5jb20k");
}

/** The server-side key. Required before any auth() call can succeed. */
export function hasClerkSecretKey(): boolean {
  return looksReal(sk(), "sk_");
}

/** Both halves present, so the app can actually authenticate people. */
export function isClerkConfigured(): boolean {
  return hasClerkPublishableKey() && hasClerkSecretKey();
}

/** What is still missing, so the setup screen can name it precisely. */
export function missingClerkKeys(): string[] {
  const missing: string[] = [];
  if (!hasClerkPublishableKey()) missing.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  if (!hasClerkSecretKey()) missing.push("CLERK_SECRET_KEY");
  return missing;
}
