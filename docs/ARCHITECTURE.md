# Architecture

The reusable package contains a React component, a pure validation layer, image decoding, and scoped CSS. It has no dependency on the demo framework.

1. The native input or a drop supplies browser File objects.
2. MIME, byte size, metadata duplicates, and count checks run before decoding.
3. The header must identify the same allowed raster format as the MIME type.
4. The browser decoder checks that the bytes form an image; decoded dimensions enforce the pixel limit.
5. Accepted files enter controlled or internal state. Rejections are returned separately and shown inline.
6. A card creates a temporary object URL and revokes it on removal/unmount. A separate URL serves the enlarged dialog preview.

Asynchronous batches are serialized. The current controlled-array identity is checked during decoding, so an external reset cancels a stale batch. Selection mutations are disabled during validation. A native dialog provides modal focus containment, with explicit focus restoration on close. After removal, focus moves to Browse files.

The component never starts a network request. The demo uses controls from the supplied starter, but these are outside the package. The browser's optional WebMCP interface exposes one read-only metadata action; it neither reads image bytes nor changes selection. Browsers without that interface continue normally.

Trade-offs: native image decoding gives real format verification but may allocate memory before the decoded-pixel check; duplicate detection is inexpensive metadata matching rather than hashing; original Files are held in memory, not persisted; no backend or upload lifecycle is invented for this component.

Future work should be driven by the consuming AI applications: upload adapters, explicit cancellation of browser decoding, richer file-type detection for missing MIME metadata, and assistive-technology audits. These are not current capabilities.
