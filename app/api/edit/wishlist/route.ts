import { NextResponse } from "next/server";
import type { WishlistItem } from "@/data/seed-reviews";
import { createWishlistItem } from "@/lib/repo";

export async function POST(req: Request) {
  let body: Partial<WishlistItem>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const item = await createWishlistItem({
    name: body.name.trim(),
    city: body.city?.trim() || "",
    note: body.note?.trim() || "",
    plannedFor: body.plannedFor?.trim() || undefined,
  });

  return NextResponse.json({ ok: true, item });
}
