import { NextResponse } from "next/server";
import { requireClinic } from "@/lib/tenancy";
import { bucket, db, isValidId, oid } from "@/lib/mongo";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  if (!isValidId(id)) return new NextResponse("Not found", { status: 404 });

  const { clinic } = await requireClinic(slug);
  const d = await db();
  const doc = await d
    .collection("documents")
    .findOne({ _id: oid(id), clinicId: oid(clinic.id) });
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const gfs = await bucket();
  const stream = gfs.openDownloadStream(doc.fileId);
  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": (doc.mimeType as string) || "application/octet-stream",
      // Always a download, never rendered in our own origin, so an uploaded file
      // can never execute script against a signed-in session.
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.fileName as string)}`,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
