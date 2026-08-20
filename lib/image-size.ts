export type ImageDimensions = { width: number; height: number };

/**
 * Minimal, dependency-free dimension reader for the formats Google
 * Photos actually exports (JPEG, PNG, WebP, GIF). Returns null on
 * anything it doesn't recognise — callers should fall back to a
 * reasonable default rather than fail the upload over it.
 */
export function getImageSize(buf: Buffer): ImageDimensions | null {
  try {
    if (isPng(buf)) return pngSize(buf);
    if (isJpeg(buf)) return jpegSize(buf);
    if (isGif(buf)) return gifSize(buf);
    if (isWebp(buf)) return webpSize(buf);
  } catch {
    return null;
  }
  return null;
}

function isPng(b: Buffer) {
  return (
    b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
  );
}
function pngSize(b: Buffer): ImageDimensions {
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function isJpeg(b: Buffer) {
  return b.length > 3 && b[0] === 0xff && b[1] === 0xd8;
}
function jpegSize(b: Buffer): ImageDimensions | null {
  let offset = 2;
  while (offset + 4 < b.length) {
    if (b[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = b[offset + 1];
    // Standalone markers with no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) break; // EOI / start of scan
    const length = b.readUInt16BE(offset + 2);
    const isSOF =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) {
      return { height: b.readUInt16BE(offset + 5), width: b.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function isGif(b: Buffer) {
  return b.length > 10 && b.toString("ascii", 0, 3) === "GIF";
}
function gifSize(b: Buffer): ImageDimensions {
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

function isWebp(b: Buffer) {
  return (
    b.length > 30 &&
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"
  );
}
function webpSize(b: Buffer): ImageDimensions | null {
  const fourcc = b.toString("ascii", 12, 16);
  if (fourcc === "VP8X") {
    const width = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
    const height = 1 + (b[27] | (b[28] << 8) | (b[29] << 16));
    return { width, height };
  }
  if (fourcc === "VP8 ") {
    return {
      width: b.readUInt16LE(26) & 0x3fff,
      height: b.readUInt16LE(28) & 0x3fff,
    };
  }
  if (fourcc === "VP8L") {
    const b0 = b[21], b1 = b[22], b2 = b[23], b3 = b[24];
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    };
  }
  return null;
}
