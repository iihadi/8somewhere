import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{jpg,jpeg,png,webp,avif}');
const ids = new Map(Object.keys(files).map((k) => [k.split('/').pop()!.replace(/\.[^.]+$/, ''), k]));

/** True once a processed image for this id exists in src/assets/images/. */
export const hasImage = (id: string) => ids.has(id);

export async function loadImage(id: string): Promise<ImageMetadata | undefined> {
  const key = ids.get(id);
  return key ? (await files[key]()).default : undefined;
}
