import { NextResponse } from "next/server";
import { reorderFeatured } from "@/lib/repo";

type Body = { slugs?: string[] };

export async function PATCH(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const slugs = (body.slugs ?? []).filter((s): s is string => typeof s === "string");
  if (slugs.length === 0) {
    return NextResponse.json({ error: "No reviews to reorder." }, { status: 400 });
  }

  await reorderFeatured(slugs);
  return NextResponse.json({ ok: true });
}
