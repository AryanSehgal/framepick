# @aryansehgal/framepick

Reusable image selection for React 18/19. React is the only runtime library used by the component; the separate demo's UI dependencies are not included.

## Install

Download the tarball and run `npm install ./aryansehgal-framepick-0.1.0.tgz`. This name is not yet published to npm.

## Controlled usage

```tsx
import { useState } from "react";
import { ImagePicker } from "@aryansehgal/framepick";
import "@aryansehgal/framepick/style.css";

export default function Example() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <ImagePicker
      value={files}
      onValueChange={setFiles}
      multiple
      maxFiles={8}
      maxSize={10 * 1024 * 1024}
      onReject={errors => console.log(errors)}
      helperText="Selected locally; upload begins only when you submit."
    />
  );
}
```

Uncontrolled: omit `value` and optionally pass `defaultValue`. Listen with `onValueChange`. Use this within a client component in server-rendered React apps.

## Props

| Prop | Type | Default / behaviour |
| --- | --- | --- |
| value | File[] | Optional controlled selection |
| defaultValue | File[] | [] — initial uncontrolled value |
| onValueChange | (files: File[]) => void | Called when the selection changes |
| onReject | (errors: FileRejection[]) => void | Reports invalid files per batch |
| onBusyChange | (busy: boolean) => void | Image validation activity |
| multiple | boolean | true |
| maxFiles | number | 8; use a positive integer; single mode always permits one |
| maxSize | number | 10 × 1024² bytes per file; use a positive finite number |
| maxPixels | number | 40,000,000 decoded pixels; use a positive finite number |
| accept | readonly ImageType[] | JPEG, PNG, WebP, GIF, AVIF; use a nonempty subset |
| disabled | boolean | false |
| label | string | Choose your images |
| helperText | string | Local selection message; empty string hides it |
| className | string | Additional root class |

Rejections have `file`, `code` (type, size, duplicate, count, decode, dimensions), and `message`. Exported types also include `ImagePickerProps`, `ImageType`, and `PickerOptions`.

The parent must update `value` in response to `onValueChange` when controlled. Do not switch between controlled and uncontrolled modes during a component's lifetime. Caller-supplied `value`/`defaultValue` is trusted and not revalidated. Changing constraints does not retroactively remove existing files; reset selection in your app if desired. Replacing the controlled array during an in-flight batch cancels that batch. Queued drops are processed in order. Do not mutate a controlled array in place.

## Styling

Import the stylesheet once. Override variables in your own stylesheet after it:

```css
.my-picker {
  --fp-blue: #087f76;
  --fp-text: #17212f;
  --fp-muted: #657080;
  --fp-border: #e2e6ed;
}
```

```tsx
<ImagePicker className="my-picker" />
```

The layout responds to the viewport. Use the `fp-*` selectors for more extensive customisation.

## Behaviour and limits

- Only JPEG/PNG/WebP/GIF/AVIF are accepted; MIME, magic bytes, and browser decoding must agree.
- Single mode has one slot. Remove the current file to select a replacement.
- Duplicate detection is based on metadata, not a content hash.
- Oversized and over-count files are rejected without decoding.
- Selected image bytes are not copied into React state; native Files are retained.
- Preview object URLs are revoked on cleanup.
- The native dialog provides Escape handling and focus containment; focus returns to the trigger.
- Animated images can animate in the browser; metadata reflects the browser-decoded dimensions.
- The pixel check happens after decoding. Validate uploads again on your server, with resource limits.
- No file bytes leave the component. A consuming app can choose to upload in its callback, so keep helperText accurate.
- No cropping, compression, upload transport, persisted selections, directory traversal, or HEIC support is included in v0.1.
- No automated accessibility certification is claimed. Perform assistive-technology testing in your consuming UI.

## License

MIT — Aryan Sehgal.
