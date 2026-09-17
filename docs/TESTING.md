# Verification — 17 September 2026

## Automated checks

`npm test`: 17 passing tests covering accepted types, exact size boundaries, empty files, unsupported types, restricted accept lists, metadata duplicates, count limits, single mode, file identity, byte formatting, format signatures, spoofed MIME, decoded dimensions, failed decoding, pixel limits, and decoder object-URL cleanup.

`npm run typecheck`: TypeScript validation passes for the demo and component.

`npm run build:component`: produces the isolated ESM library, declaration files, CSS, and installable tarball. The tarball excludes demo assets and has no bundled React or UI-library dependency.

`npm run build`: generates the static demo in dist/client.

## Browser checks performed

- Native file chooser allows multiple PNGs and shows thumbnails, file sizes, and dimensions.
- A corrupt PNG and a text file receive distinct rejection messages.
- Selecting the same file twice reports a duplicate without adding another card.
- The 1 MB option rejects a generated 2 MB file.
- Single mode changes the native chooser to a single file and rejects a second selection when full.
- Enlarged preview opens; Escape closes it and restores focus to the original preview button.
- Removing a selected image returns focus to Browse files.
- Clear all removes selected files and clears rejection messages.
- Disabled state disables Browse files.
- Accent selection and the Integration tab update correctly.
- Narrow-layout checks showed no horizontal document overflow in the playground and Integration tab.
- The optional WebMCP metadata tool returns the current selection; unexpected input is rejected without changing it.

These checks were performed in the Codex in-app browser. This is not a full cross-browser or screen-reader certification. Native drag-and-drop from the operating system, iOS/Android devices, high-memory images, and each allowed format's decoder should receive broader testing before a stable public package release. Validation tests use mocked image decoders for lifecycle checks; the browser checks use real generated PNGs.

## Settings appearance regression checks

Verified against the production static export after fixing the settings controls:

- Open both Max images and Max file size: each menu has a computed white background (`rgb(255, 255, 255)`) at full opacity and readable highlighted options.
- Toggle Multiple images and Disabled state using mouse and Space: both knobs remain inside their tracks. At rest, the knob has 2px top/bottom spacing and 2px spacing from the active edge in either state.
- Single-image mode still disables Max images; Disabled state still disables Browse files. Selecting 5 MB updates the picker limit.
- Check production output, not just development: independent CSS `translate` and `transform` values can stack, and CSS optimization can combine transform declarations. The custom switches now use only the primitive's existing translation mechanism.

## Repeatable fixtures

`npm run fixtures` generates original abstract PNGs, a corrupt PNG, a text file, and an oversized file under work/fixtures. It also creates the public downloadable sample. No personal photographs are included.
