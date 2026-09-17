# Framepick

An image-first React file picker with a live playground. Built from scratch using a native file input, drag events, object URLs, and the browser's image decoder.

**Author:** Aryan Sehgal  
**Status:** v0.1.0 · package downloadable locally; not published to npm

## Features

- Select or drag multiple images; single-selection mode.
- JPEG, PNG, WebP, GIF, and AVIF (subject to browser decoder support).
- Configurable count, byte-size, and decoded-pixel limits.
- MIME allowlist, file-signature checks, decoding validation, and metadata-based duplicate detection.
- Thumbnail previews, dimensions, original file sizes, and a native-dialog full preview.
- Remove files, clear selection, and reselect a removed file.
- Controlled and uncontrolled state.
- Keyboard-operable controls, visible focus, live announcements, and focus restoration.
- Object URLs revoked on removal/unmount; asynchronous file batches serialized.
- Responsive demo with settings, integration examples, and a downloadable library.

Files remain local in this demo. No upload service, account, analytics, or third-party image request is involved. Selection disappears when you reload.

## Run the project

Requires Node.js 22.13+ and npm. Node 25.2.1 was used during initial development.

```sh
npm ci
npm run build:component
npm run fixtures
npm run dev
```

The development server prints its URL (normally http://localhost:5173).

```sh
npm test
npm run typecheck
npm run build
```

## Repository structure

- `packages/react/src/`: standalone picker and validation; no Next.js, Radix, or Tailwind dependency.
- `packages/react/`: library manifest, build configuration, and API documentation.
- `app/`: the demo, using React/Next-compatible routing through Vinext.
- `components/ui/`: starter-provided controls used only by the playground.
- `tests/`: validation and image-resource lifecycle tests.
- `scripts/`: library packaging, fixture generation, and development/build helpers.
- `docs/`: architecture, testing notes, and deployment instructions.

The file picker is original project code. The surrounding demo uses the Sites starter and Radix-based controls for settings and tabs. Those controls are not bundled with the picker.

## Use in another React project

Build the package, then install the generated archive:

```sh
npm run build:component
# In your consuming application:
npm install /absolute/path/to/aryansehgal-framepick-0.1.0.tgz
```

The archive is generated in `public/downloads/`.

```tsx
import { useState } from "react";
import { ImagePicker } from "@aryansehgal/framepick";
import "@aryansehgal/framepick/style.css";

export function PhotoInput() {
  const [files, setFiles] = useState<File[]>([]);
  return <ImagePicker value={files} onValueChange={setFiles} multiple={false} />;
}
```

For an AI application, pass the selected native `File` to your own inference/upload layer. Keep server credentials out of frontend code. Validation here improves selection UX; it is not a server-side security boundary.

## Design boundaries

This release deliberately focuses on selection and inspection. It does not upload, crop, compress, persist files, traverse directories, or provide resumable transfers. Single mode fills one slot; remove the existing image to replace it. Duplicate checks use filename, size, MIME type, and last-modified time, not content hashing.

HEIC/HEIF and SVG are excluded. The pixel limit is checked after browser decoding; it cannot prevent all memory allocation caused by hostile files. Browser support determines AVIF decoding. Very large batches are constrained by the count and byte limits, but this is not a hardened hostile-file processor.

## Deployment and verification

See [deployment](docs/DEPLOYMENT.md), [architecture](docs/ARCHITECTURE.md), and [testing](docs/TESTING.md). Use a public demo URL in your résumé only after confirming signed-out access. A private Sites preview is not a public portfolio link.

## License

MIT for original Framepick code. Starter dependencies retain their own licenses.
