import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

/**
 * Standard Vercel Node serverless functions cap request bodies around
 * ~4.5MB — fine for photos (15MB cap, buffered server-side in
 * app/api/edit/upload/route.ts) but video clips blow past that
 * routinely. This route instead hands the browser a short-lived,
 * scoped upload token so the video bytes go straight from the browser
 * to Blob storage, bypassing this server entirely. Only reachable in
 * Blob mode (see storageMode() gating on the client) — local dev uses
 * app/api/edit/upload-video/route.ts instead. Sits under /api/edit/*,
 * so middleware.ts's existing session-cookie auth already protects it.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ["video/mp4", "video/quicktime"],
        addRandomSuffix: true,
        pathname: `videos/${pathname}`,
        maximumSizeInBytes: 300 * 1024 * 1024, // 300MB
      }),
      onUploadCompleted: async () => {
        // No server-side bookkeeping needed — the client PATCHes the
        // review's `videos` field itself once the upload resolves,
        // exactly like it already does for photos.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 400 }
    );
  }
}
