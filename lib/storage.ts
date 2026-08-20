import "server-only";
import { head, put, del } from "@vercel/blob";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedReviews, type Review } from "@/data/seed-reviews";

/**
 * Two backends behind one interface, picked automatically:
 *
 *  - BLOB_READ_WRITE_TOKEN set  -> Vercel Blob (works on Vercel; Vercel
 *    injects this env var automatically once a Blob store is linked to
 *    the project).
 *  - not set                    -> local files under data/ and
 *    public/uploads/, so `npm run dev` works with zero cloud setup.
 *
 * Either way, review data is one JSON document, read-modify-written
 * whole. Fine for a single-admin blog with a few hundred reviews; not
 * meant to survive concurrent writers.
 */

const REVIEWS_BLOB_PATH = "data/reviews.json";
const LOCAL_DATA_PATH = path.join(process.cwd(), "data", "reviews.local.json");
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

function useBlob() {
  return Boolean(blobToken());
}

export async function readReviewsData(): Promise<Review[]> {
  if (useBlob()) {
    try {
      const meta = await head(REVIEWS_BLOB_PATH, { token: blobToken() });
      const res = await fetch(meta.url, { cache: "no-store" });
      if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
      return (await res.json()) as Review[];
    } catch {
      // No blob yet (fresh project) — bootstrap from the seed data.
      await writeReviewsData(seedReviews);
      return seedReviews;
    }
  }

  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf8");
    return JSON.parse(raw) as Review[];
  } catch {
    await writeReviewsData(seedReviews);
    return seedReviews;
  }
}

export async function writeReviewsData(reviews: Review[]): Promise<void> {
  if (useBlob()) {
    // Vercel Blob has no built-in "overwrite this path" primitive we can
    // rely on across SDK versions, so delete-then-write instead of
    // trusting an addRandomSuffix:false put to replace in place.
    try {
      const meta = await head(REVIEWS_BLOB_PATH, { token: blobToken() });
      await del(meta.url, { token: blobToken() });
    } catch {
      /* nothing to delete yet */
    }
    await put(REVIEWS_BLOB_PATH, JSON.stringify(reviews, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      token: blobToken(),
    });
    return;
  }

  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, JSON.stringify(reviews, null, 2), "utf8");
}

/**
 * `pathname` is relative, e.g. "septime/1699999999-dinner.jpg" — the
 * slug as a folder keeps a restaurant's images grouped in both backends.
 */
export async function uploadImage(
  buffer: Buffer,
  pathname: string,
  contentType: string
): Promise<{ url: string }> {
  if (useBlob()) {
    const blob = await put(`photos/${pathname}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType,
      token: blobToken(),
    });
    return { url: blob.url };
  }

  const destDir = path.join(LOCAL_UPLOADS_DIR, path.dirname(pathname));
  await mkdir(destDir, { recursive: true });
  const filename = path.basename(pathname);
  await writeFile(path.join(destDir, filename), buffer);
  return { url: path.posix.join("/uploads", path.dirname(pathname), filename) };
}

export async function deleteImage(url: string): Promise<void> {
  if (useBlob() && url.includes("blob.vercel-storage.com")) {
    await del(url, { token: blobToken() });
    return;
  }
  if (url.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", url));
    } catch {
      /* already gone */
    }
  }
}

export function storageMode(): "blob" | "local" {
  return useBlob() ? "blob" : "local";
}
