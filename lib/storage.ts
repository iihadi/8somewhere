import "server-only";
import { head, put, del, BlobNotFoundError } from "@vercel/blob";
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
    let meta;
    try {
      meta = await head(REVIEWS_BLOB_PATH, { token: blobToken() });
    } catch (err) {
      if (err instanceof BlobNotFoundError) {
        // Genuinely no data yet (fresh project) — bootstrap from seed.
        await writeReviewsData(seedReviews);
        return seedReviews;
      }
      // Any other failure (network blip, rate limit, etc.) must NOT be
      // treated as "no data" — that previously caused a transient error
      // to silently wipe live review data back to the seed. Let it
      // propagate instead.
      throw err;
    }

    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch reviews blob: ${res.status}`);
    }
    return (await res.json()) as Review[];
  }

  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf8");
    return JSON.parse(raw) as Review[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      await writeReviewsData(seedReviews);
      return seedReviews;
    }
    throw err;
  }
}

export async function writeReviewsData(reviews: Review[]): Promise<void> {
  if (useBlob()) {
    // `put()` with addRandomSuffix:false overwrites the existing blob at
    // this path in place — verified empirically, no delete-first dance
    // needed. A prior version of this function deleted the old blob
    // before writing the new one, which opened a window where the blob
    // didn't exist; any read landing in that window looked exactly like
    // "no data yet" and reseeded the whole database from scratch. That
    // silently destroyed live data more than once. Do not reintroduce it.
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
