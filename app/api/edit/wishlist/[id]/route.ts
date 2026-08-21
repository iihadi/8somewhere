import { NextResponse } from "next/server";
import { deleteWishlistItem } from "@/lib/repo";

type Params = { params: Promise<{ id: string }> };

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
