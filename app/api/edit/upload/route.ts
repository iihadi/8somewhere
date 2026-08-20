import { NextResponse } from "next/server";
import { getImageSize } from "@/lib/image-size";
import { deleteImage, uploadImage } from "@/lib/storage";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB — generous for phone photos
const DEFAULT_DIMENSIONS = { width: 1600, height: 1200 };

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
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
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are accepted." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dims = getImageSize(buffer) ?? DEFAULT_DIMENSIONS;
  const pathname = `${slug}/${Date.now()}-${safeName(file.name)}`;

  const { url: fileUrl } = await uploadImage(buffer, pathname, file.type);

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
