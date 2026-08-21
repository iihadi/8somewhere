import { NextResponse } from "next/server";
import type { Review } from "@/data/seed-reviews";
import { bulkUpdateReviews } from "@/lib/repo";
import { sanitiseBadges, type BadgeKey } from "@/lib/badges";

type Action =
  | "add-tag"
  | "remove-tag"
  | "add-badge"
  | "remove-badge"
  | "set-city"
  | "mark-draft"
  | "mark-published";

type Body = { slugs?: string[]; action?: Action; value?: string };

function mutator(action: Action, value: string | undefined): (r: Review) => Review {
  switch (action) {
    case "add-tag":
      return (r) =>
        value && !r.tags.includes(value) ? { ...r, tags: [...r.tags, value] } : r;
    case "remove-tag":
      return (r) => ({ ...r, tags: r.tags.filter((t) => t !== value) });
    case "add-badge":
      return (r) => ({
        ...r,
        badges: sanitiseBadges([...(r.badges ?? []), value as BadgeKey]),
      });
    case "remove-badge":
      return (r) => ({
        ...r,
        badges: sanitiseBadges((r.badges ?? []).filter((b) => b !== value)),
      });
    case "set-city":
      return (r) => ({ ...r, city: value ?? r.city });
    case "mark-draft":
      return (r) => ({ ...r, draft: true });
    case "mark-published":
      return (r) => ({ ...r, draft: undefined });
  }
}

const ACTIONS: Action[] = [
  "add-tag",
  "remove-tag",
  "add-badge",
  "remove-badge",
  "set-city",
  "mark-draft",
  "mark-published",
];

export async function PATCH(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const slugs = (body.slugs ?? []).filter((s): s is string => typeof s === "string");
  if (slugs.length === 0) {
    return NextResponse.json({ error: "No reviews selected." }, { status: 400 });
  }
  if (!body.action || !ACTIONS.includes(body.action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  if (
    ["add-tag", "remove-tag", "add-badge", "remove-badge", "set-city"].includes(
      body.action
    ) &&
    !body.value?.trim()
  ) {
    return NextResponse.json({ error: "Missing value." }, { status: 400 });
  }

  const touched = await bulkUpdateReviews(
    slugs,
    mutator(body.action, body.value?.trim())
  );

  return NextResponse.json({ ok: true, touched });
}
