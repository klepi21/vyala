import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/config";

const isProtected = createRouteMatcher(["/c/(.*)", "/app(.*)", "/onboarding(.*)"]);

// Until real Clerk keys are in .env.local, pass everything through so the
// landing page and setup screens render without a Clerk handshake redirect.
const proxy = isClerkConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (isProtected(req)) await auth.protect();
    })
  : () => NextResponse.next();

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
