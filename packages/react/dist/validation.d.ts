export declare const IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export type ImageType = (typeof IMAGE_TYPES)[number];
export type RejectionCode = "type" | "size" | "duplicate" | "count" | "decode" | "dimensions";
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
export declare const fileKey: (file: File) => string;
export declare class ImageValidationError extends Error {
    code: RejectionCode;
    constructor(code: RejectionCode, message: string);
}
export declare function detectImageType(bytes: Uint8Array): ImageType | null;
export declare function formatBytes(bytes: number): string;
export declare function checkFile(file: File, existing: readonly File[], options: PickerOptions): FileRejection | null;
export declare function inspectImage(file: File, maxPixels?: number): Promise<{
    width: number;
    height: number;
}>;
