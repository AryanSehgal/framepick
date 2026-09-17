"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  checkFile,
  fileKey,
  formatBytes,
  IMAGE_TYPES,
  ImageValidationError,
  inspectImage,
} from "./validation";
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

function useObjectUrl(file: File) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

function FileCard({
  file,
  disabled,
  onRemove,
  onPreview,
}: {
  file: File;
  disabled: boolean;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const url = useObjectUrl(file);
  const [dimensions, setDimensions] = useState("");
  return (
    <li className="fp-file">
      <div className="fp-thumbnail">
        <button
          type="button"
          className="fp-preview-button"
          onClick={onPreview}
          aria-label={`Preview ${file.name}`}
        >
          {url && (
            <img
              src={url}
              alt=""
              onLoad={(event) =>
                setDimensions(
                  `${event.currentTarget.naturalWidth} × ${event.currentTarget.naturalHeight}`,
                )
              }
            />
          )}
          <span className="fp-expand" aria-hidden="true">
            ⤢
          </span>
        </button>
        <button
          className="fp-remove"
          type="button"
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
        >
          ×
        </button>
      </div>
      <div className="fp-file-info">
        <strong title={file.name}>{file.name}</strong>
        <span>
          {formatBytes(file.size)} ·{" "}
          {file.type.replace("image/", "").toUpperCase()}
        </span>
        {dimensions && <span>{dimensions} px</span>}
      </div>
    </li>
  );
}

function ImagePreview({ file, onClose }: { file: File; onClose: () => void }) {
  const url = useObjectUrl(file);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="fp-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="fp-dialog-header">
        <div>
          <h2 id={titleId}>{file.name}</h2>
          <p>{formatBytes(file.size)} · Preview</p>
        </div>
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          autoFocus
        >
          ×
        </button>
      </div>
      <div className="fp-dialog-image">
        {url && <img src={url} alt={file.name} />}
      </div>
      <p className="fp-dialog-footer">Press Escape to close</p>
    </dialog>
  );
}

/** Local selection only. This component never uploads a file or calls a network API. */
export function ImagePicker({
  value,
  defaultValue = [],
  onValueChange,
  onReject,
  onBusyChange,
  disabled = false,
  className = "",
  label = "Choose your images",
  helperText = "Images are selected locally. Your app controls what happens next.",
  accept = IMAGE_TYPES,
  multiple = true,
  maxFiles = 8,
  maxSize = 10 * 1024 ** 2,
  maxPixels = 40_000_000,
}: ImagePickerProps) {
  const [internal, setInternal] = useState<File[]>(defaultValue);
  const files = value ?? internal;
  const filesRef = useRef(files);
  filesRef.current = files;
  const propsRef = useRef({
    value,
    onValueChange,
    onReject,
    onBusyChange,
    disabled,
    accept,
    multiple,
    maxFiles,
    maxSize,
    maxPixels,
  });
  propsRef.current = {
    value,
    onValueChange,
    onReject,
    onBusyChange,
    disabled,
    accept,
    multiple,
    maxFiles,
    maxSize,
    maxPixels,
  };
  const input = useRef<HTMLInputElement>(null);
  const browseButton = useRef<HTMLButtonElement>(null);
  const mounted = useRef(true);
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FileRejection[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [preview, setPreview] = useState<File | null>(null);
  const id = useId();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const commit = (next: File[]) => {
    filesRef.current = next;
    if (propsRef.current.value === undefined) setInternal(next);
    propsRef.current.onValueChange?.(next);
  };
  const add = (incoming: File[]) => {
    if (propsRef.current.disabled || !incoming.length) return;
    setAnnouncement("");
    pending.current++;
    setBusy(true);
    propsRef.current.onBusyChange?.(true);
    // Serialize drops so overlapping decodes cannot lose files or exceed limits.
    queue.current = queue.current
      .catch(() => undefined)
      .then(async () => {
        if (!mounted.current || propsRef.current.disabled) return;
        const initial = filesRef.current;
        const rejected: FileRejection[] = [];
        const accepted: File[] = [];
        for (const file of incoming) {
          if (
            !mounted.current ||
            propsRef.current.disabled ||
            filesRef.current !== initial
          )
            return;
          const rejection = checkFile(
            file,
            [...initial, ...accepted],
            propsRef.current,
          );
          if (rejection) {
            rejected.push(rejection);
            continue;
          }
          try {
            await inspectImage(file, propsRef.current.maxPixels);
            accepted.push(file);
          } catch (error) {
            rejected.push({
              file,
              code:
                error instanceof ImageValidationError ? error.code : "decode",
              message:
                error instanceof Error
                  ? error.message
                  : "Could not open this image.",
            });
          }
        }
        if (
          !mounted.current ||
          propsRef.current.disabled ||
          filesRef.current !== initial
        )
          return;
        if (accepted.length) commit([...initial, ...accepted]);
        setErrors(rejected);
        setAnnouncement(
          `${accepted.length} image${accepted.length === 1 ? "" : "s"} added. ${rejected.length ? `${rejected.length} rejected.` : ""}`,
        );
        if (rejected.length) propsRef.current.onReject?.(rejected);
      })
      .finally(() => {
        pending.current--;
        if (mounted.current && pending.current === 0) {
          setBusy(false);
          propsRef.current.onBusyChange?.(false);
        }
      });
  };
  const remove = (file: File) => {
    commit(files.filter((item) => fileKey(item) !== fileKey(file)));
    setErrors([]);
    setAnnouncement(`${file.name} removed.`);
    browseButton.current?.focus();
  };
  const clear = () => {
    commit([]);
    setErrors([]);
    setAnnouncement("Selection cleared.");
    browseButton.current?.focus();
  };
  const types = accept
    .map((type) =>
      type.replace("image/", "").replace("jpeg", "jpg").toUpperCase(),
    )
    .join(", ");
  return (
    <section
      className={`fp-root ${className}`}
      aria-label={label}
      aria-busy={busy}
    >
      <div className="fp-heading">
        <div>
          <h2>{label}</h2>
          <p>
            {multiple
              ? "A few favourites, or a whole collection."
              : "One image. A world of possibilities."}
          </p>
        </div>
        <span className="fp-count">
          {files.length} / {multiple ? maxFiles : 1}
        </span>
      </div>
      <div
        className={`fp-dropzone ${dragging ? "fp-dragging" : ""} ${disabled ? "fp-disabled" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (disabled || !event.dataTransfer.types.includes("Files")) return;
          dragDepth.current++;
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = disabled ? "none" : "copy";
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current--;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          add(Array.from(event.dataTransfer.files));
        }}
      >
        <div className="fp-drop-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="8" cy="8" r="1.5" />
            <path d="m3 17 5-5 4 4 4-6 5 7" />
          </svg>
          <span>+</span>
        </div>
        <h3>
          {dragging
            ? "Right here. Drop them in."
            : "Your next idea starts here."}
        </h3>
        <p>Drag & drop your images, or choose from your device.</p>
        <button
          ref={browseButton}
          className="fp-browse"
          type="button"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
          aria-describedby={`${id}-help`}
        >
          {busy ? "Checking images…" : "Browse files"}
          <span aria-hidden="true">↗</span>
        </button>
        <input
          ref={input}
          id={`${id}-input`}
          type="file"
          accept={accept.join(",")}
          multiple={multiple}
          disabled={disabled || busy}
          aria-label={label}
          tabIndex={-1}
          className="fp-hidden-input"
          onChange={(event) => {
            add(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <p className="fp-help" id={`${id}-help`}>
          {types} · Up to {formatBytes(maxSize)} each
        </p>
      </div>
      {errors.length > 0 && (
        <div className="fp-errors" role="alert">
          <strong>Some images couldn’t be added</strong>
          <ul>
            {errors.slice(0, 10).map((error, i) => (
              <li key={i}>
                <b>{error.file.name}</b>: {error.message}
              </li>
            ))}
          </ul>
          {errors.length > 10 && (
            <p>And {errors.length - 10} more. Try a smaller batch.</p>
          )}
          <button
            type="button"
            onClick={() => {
              setErrors([]);
              browseButton.current?.focus();
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      {files.length > 0 && (
        <div className="fp-selection">
          <div className="fp-selection-heading">
            <h3>
              Selected images <span>{files.length}</span>
            </h3>
            <button type="button" disabled={disabled || busy} onClick={clear}>
              Clear all
            </button>
          </div>
          <ul className="fp-grid">
            {files.map((file) => (
              <FileCard
                key={fileKey(file)}
                file={file}
                disabled={disabled || busy}
                onRemove={() => remove(file)}
                onPreview={() => setPreview(file)}
              />
            ))}
          </ul>
        </div>
      )}
      {helperText && (
        <p className="fp-privacy">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="5" y="10" width="14" height="11" rx="3" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          {helperText}
        </p>
      )}
      <span className="fp-sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      {preview && (
        <ImagePreview file={preview} onClose={() => setPreview(null)} />
      )}
    </section>
  );
}
