import test from "node:test";
import assert from "node:assert/strict";
import {
  checkFile,
  detectImageType,
  fileKey,
  formatBytes,
  inspectImage,
  ImageValidationError,
} from "../packages/react/src/validation.ts";

const makeFile = (
  name = "a.png",
  size = 100,
  type = "image/png",
  modified = 1,
) => new File([new Uint8Array(size)], name, { type, lastModified: modified });
test("accepts an allowed file within all limits", () =>
  assert.equal(checkFile(makeFile(), [], {}), null));
test("accepts the exact size boundary", () =>
  assert.equal(checkFile(makeFile("a.png", 100), [], { maxSize: 100 }), null));
test("rejects one byte over the size limit", () =>
  assert.equal(
    checkFile(makeFile("a.png", 101), [], { maxSize: 100 })?.code,
    "size",
  ));
test("rejects SVG and unrelated files", () => {
  for (const type of ["image/svg+xml", "text/plain", ""])
    assert.equal(checkFile(makeFile("a", 100, type), [], {})?.code, "type");
});
test("respects a narrower accepted-type list", () =>
  assert.equal(
    checkFile(makeFile(), [], { accept: ["image/jpeg"] })?.code,
    "type",
  ));
test("rejects an empty file", () =>
  assert.equal(checkFile(makeFile("a.png", 0), [], {})?.code, "decode"));
test("rejects matching metadata duplicates", () =>
  assert.equal(checkFile(makeFile(), [makeFile()], {})?.code, "duplicate"));
test("does not mistake a changed file for a duplicate", () =>
  assert.equal(checkFile(makeFile("a.png", 101), [makeFile()], {}), null));
test("rejects a full selection", () =>
  assert.equal(
    checkFile(makeFile("b.png"), [makeFile()], { maxFiles: 1 })?.code,
    "count",
  ));
test("single mode enforces one slot regardless of maxFiles", () =>
  assert.equal(
    checkFile(makeFile("b.png"), [makeFile()], { multiple: false, maxFiles: 8 })
      ?.code,
    "count",
  ));
test("file identity escapes unusual filename delimiters", () =>
  assert.notEqual(fileKey(makeFile("a,100")), fileKey(makeFile("a"))));
test("byte sizes remain legible at boundaries", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(1024), "1.0 KB");
  assert.equal(formatBytes(1048576), "1.0 MB");
});
test("recognizes all supported file signatures", () => {
  assert.equal(
    detectImageType(new Uint8Array([255, 216, 255, 0])),
    "image/jpeg",
  );
  assert.equal(
    detectImageType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])),
    "image/png",
  );
  assert.equal(detectImageType(Buffer.from("GIF89a")), "image/gif");
  assert.equal(detectImageType(Buffer.from("RIFF0000WEBP")), "image/webp");
  assert.equal(detectImageType(Buffer.from("0000ftypavif0000")), "image/avif");
  assert.equal(detectImageType(Buffer.from("<svg></svg>")), null);
});
test("rejects spoofed MIME before constructing a decoder", async () => {
  await assert.rejects(
    inspectImage(
      new File(["<svg></svg>"], "pretend.png", { type: "image/png" }),
    ),
    (error: unknown) =>
      error instanceof ImageValidationError && error.code === "type",
  );
});
const pngFile = () =>
  new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "valid.png", {
    type: "image/png",
  });
async function withDecoder(
  width: number,
  height: number,
  fails: boolean,
  action: (revoked: string[]) => Promise<void>,
) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "Image");
  const revoked: string[] = [];
  const create = URL.createObjectURL,
    revoke = URL.revokeObjectURL;
  URL.createObjectURL = () => "blob:test-fixture";
  URL.revokeObjectURL = (url) => {
    revoked.push(url);
  };
  class Decoder {
    naturalWidth = width;
    naturalHeight = height;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(value: string) {
      if (value)
        queueMicrotask(() => (fails ? this.onerror?.() : this.onload?.()));
    }
  }
  Object.defineProperty(globalThis, "Image", {
    configurable: true,
    value: Decoder,
  });
  try {
    await action(revoked);
  } finally {
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
    if (original) Object.defineProperty(globalThis, "Image", original);
    else Reflect.deleteProperty(globalThis, "Image");
  }
}
test("returns dimensions and releases decoder URL on success", async () =>
  withDecoder(960, 640, false, async (revoked) => {
    assert.deepEqual(await inspectImage(pngFile()), {
      width: 960,
      height: 640,
    });
    assert.deepEqual(revoked, ["blob:test-fixture"]);
  }));
test("releases decoder URL on corrupt-image failure", async () =>
  withDecoder(0, 0, true, async (revoked) => {
    await assert.rejects(
      inspectImage(pngFile()),
      (error: unknown) =>
        error instanceof ImageValidationError && error.code === "decode",
    );
    assert.deepEqual(revoked, ["blob:test-fixture"]);
  }));
test("rejects excessive decoded pixels and releases URL", async () =>
  withDecoder(10000, 10000, false, async (revoked) => {
    await assert.rejects(
      inspectImage(pngFile()),
      (error: unknown) =>
        error instanceof ImageValidationError && error.code === "dimensions",
    );
    assert.deepEqual(revoked, ["blob:test-fixture"]);
  }));
