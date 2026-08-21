import { NextResponse } from "next/server";
import type { WishlistItem } from "@/data/seed-reviews";
import { deleteWishlistItem, updateWishlistItem } from "@/lib/repo";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;

  let body: Partial<WishlistItem>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const patch: Partial<Omit<WishlistItem, "id">> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.city !== undefined) patch.city = body.city.trim();
  if (body.note !== undefined) patch.note = body.note.trim();
  if (body.cuisine !== undefined) patch.cuisine = body.cuisine.trim() || undefined;

  try {
    const item = await updateWishlistItem(id, patch);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update item." },
      { status: 404 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteWishlistItem(id);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to remove item." },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
