export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];
export type RejectionCode =
  | "type"
  | "size"
  | "duplicate"
  | "count"
  | "decode"
  | "dimensions";
export interface FileRejection {
  file: File;
  code: RejectionCode;
  message: string;
}
export interface PickerOptions {
  accept?: readonly ImageType[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  maxPixels?: number;
}
export const fileKey = (file: File) =>
  JSON.stringify([file.name, file.size, file.lastModified, file.type]);
export class ImageValidationError extends Error {
  code: RejectionCode;
  constructor(code: RejectionCode, message: string) {
    super(message);
    this.code = code;
  }
}
export function detectImageType(bytes: Uint8Array): ImageType | null {
  const text = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (byte, index) => bytes[index] === byte,
    )
  )
    return "image/png";
  if (text(0, 6) === "GIF87a" || text(0, 6) === "GIF89a") return "image/gif";
  if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") return "image/webp";
  if (
    text(4, 8) === "ftyp" &&
    [8, 16, 20, 24, 28].some((offset) =>
      ["avif", "avis"].includes(text(offset, offset + 4)),
    )
  )
    return "image/avif";
  return null;
}
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
export function checkFile(
  file: File,
  existing: readonly File[],
  options: PickerOptions,
): FileRejection | null {
  const reject = (code: RejectionCode, message: string): FileRejection => ({
    file,
    code,
    message,
  });
  if (!(options.accept ?? IMAGE_TYPES).includes(file.type as ImageType))
    return reject("type", "This image format is not supported.");
  if (file.size === 0) return reject("decode", "This file is empty.");
  if (file.size > (options.maxSize ?? 10 * 1024 ** 2))
    return reject(
      "size",
      `Exceeds the ${formatBytes(options.maxSize ?? 10 * 1024 ** 2)} limit.`,
    );
  if (existing.some((item) => fileKey(item) === fileKey(file)))
    return reject("duplicate", "This image is already selected.");
  if (
    existing.length >=
    (options.multiple === false ? 1 : (options.maxFiles ?? 8))
  )
    return reject(
      "count",
      "The selection is full. Remove an image to add another.",
    );
  return null;
}
export async function inspectImage(
  file: File,
  maxPixels = 40_000_000,
): Promise<{ width: number; height: number }> {
  const detected = detectImageType(
    new Uint8Array(await file.slice(0, 32).arrayBuffer()),
  );
  if (!detected || detected !== file.type)
    throw new ImageValidationError(
      "type",
      "The file contents don’t match a supported image format.",
    );
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        img.src = "";
        reject(
          new ImageValidationError(
            "decode",
            "The image took too long to open.",
          ),
        );
      }, 15_000);
      img.onload = () => {
        clearTimeout(timeout);
        if (
          !img.naturalWidth ||
          img.naturalWidth * img.naturalHeight > maxPixels
        )
          reject(
            new ImageValidationError(
              "dimensions",
              `Image must be within ${Math.round(maxPixels / 1_000_000)} megapixels.`,
            ),
          );
        else resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(
          new ImageValidationError(
            "decode",
            "This file could not be decoded as an image.",
          ),
        );
      };
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
