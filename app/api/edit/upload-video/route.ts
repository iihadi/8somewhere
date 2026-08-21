import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/storage";

// Generous — this route only ever runs against the local filesystem
// (see storageMode() gating on the client), so there's no Vercel
// serverless request-body ceiling to worry about here.
const MAX_BYTES = 500 * 1024 * 1024; // 500MB

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
}

function looksLikeVideo(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "video/mp4" ||
    type === "video/quicktime" ||
    name.endsWith(".mp4") ||
    name.endsWith(".mov")
  );
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim() || "misc";

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is larger than 500MB." }, { status: 413 });
  }
  if (!looksLikeVideo(file)) {
    return NextResponse.json(
      { error: "Only .mp4/.mov video files are accepted." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "video/mp4";
  const pathname = `${slug}/${Date.now()}-${safeName(file.name)}`;

  const { url: fileUrl } = await uploadImage(buffer, pathname, contentType, "videos");

  return NextResponse.json({ url: fileUrl });
}
