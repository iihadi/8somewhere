import { NextResponse } from "next/server";
import { getAllReviews } from "@/lib/repo";
import { sortByDate } from "@/lib/derive";

export const dynamic = "force-dynamic";

/** RFC 4180 quoting: wrap in quotes, double any internal quotes. */
function csvCell(value: unknown): string {
  if (value == null) return "";
  const s = Array.isArray(value) ? value.join(" | ") : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

const COLUMNS = [
  "slug",
  "name",
  "city",
  "country",
  "address",
  "lat",
  "lng",
  "cuisine",
  "visitedAt",
  "price",
  "tier",
  "verdict",
  "quote",
  "tags",
  "closed",
  "revisited",
  "needsCheck",
  "photoCount",
  "body",
] as const;

export async function GET(req: Request) {
  const format = new URL(req.url).searchParams.get("format") ?? "json";
  const reviews = sortByDate(await getAllReviews());
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const header = COLUMNS.join(",");
    const rows = reviews.map((r) =>
      COLUMNS.map((c) => {
        if (c === "photoCount") return csvCell(r.photos?.length ?? 0);
        if (c === "body") return csvCell((r.body ?? []).join("\n\n"));
        return csvCell(r[c as keyof typeof r]);
      }).join(",")
    );
    // BOM so Excel opens the £ and accented characters correctly.
    const csv = "\uFEFF" + [header, ...rows].join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="8somewhere-${stamp}.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(reviews, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="8somewhere-${stamp}.json"`,
    },
  });
}
