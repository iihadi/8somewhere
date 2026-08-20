import { NextResponse } from "next/server";
import convertHeic from "heic-convert";
import { getImageSize } from "@/lib/image-size";
import { deleteImage, uploadImage } from "@/lib/storage";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB — generous for phone photos
const DEFAULT_DIMENSIONS = { width: 1600, height: 1200 };

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
}

/**
 * iOS reports HEIC/HEIF photos with all sorts of MIME types depending
 * on how they left the phone — sometimes the correct image/heic,
 * sometimes empty, sometimes application/octet-stream. The file
 * extension is the one thing that's reliably present.
 */
function isHeic(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

function looksLikeImage(file: File) {
  return file.type.startsWith("image/") || isHeic(file);
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
    return NextResponse.json({ error: "File is larger than 15MB." }, { status: 413 });
  }
  if (!looksLikeImage(file)) {
    return NextResponse.json({ error: "Only image files are accepted." }, { status: 400 });
  }

  let buffer = Buffer.from(await file.arrayBuffer());
  let contentType = file.type || "application/octet-stream";
  let filename = file.name;

  if (isHeic(file)) {
    try {
      const jpeg = await convertHeic({
        buffer: new Uint8Array(buffer),
        format: "JPEG",
        quality: 0.9,
      });
      buffer = Buffer.from(jpeg);
      contentType = "image/jpeg";
      filename = filename.replace(/\.(heic|heif)$/i, "") + ".jpg";
    } catch {
      return NextResponse.json(
        { error: "Couldn't convert that HEIC photo. Try exporting it as JPEG first." },
        { status: 422 }
      );
    }
  }

  const dims = getImageSize(buffer) ?? DEFAULT_DIMENSIONS;
  const pathname = `${slug}/${Date.now()}-${safeName(filename)}`;

  const { url: fileUrl } = await uploadImage(buffer, pathname, contentType);

  return NextResponse.json({ url: fileUrl, width: dims.width, height: dims.height });
}

export async function DELETE(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  if (!body.url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }
  await deleteImage(body.url);
  return NextResponse.json({ ok: true });
}
