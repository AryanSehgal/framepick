import type { FileRejection, PickerOptions } from "./validation";
export interface ImagePickerProps extends PickerOptions {
    /** Controlled selection. Update this from onValueChange. */
    value?: File[];
    /** Initial selection for uncontrolled usage. Parent-supplied files are trusted. */
    defaultValue?: File[];
    onValueChange?: (files: File[]) => void;
    onReject?: (rejections: FileRejection[]) => void;
    onBusyChange?: (busy: boolean) => void;
    disabled?: boolean;
    className?: string;
    label?: string;
    /** Keep this accurate if the consuming app uploads in onValueChange. */
    helperText?: string;
}
/** Local selection only. This component never uploads a file or calls a network API. */
export declare function ImagePicker({ value, defaultValue, onValueChange, onReject, onBusyChange, disabled, className, label, helperText, accept, multiple, maxFiles, maxSize, maxPixels, }: ImagePickerProps): import("react/jsx-runtime").JSX.Element;
