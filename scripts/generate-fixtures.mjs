import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

// Original abstract colour fields, generated as small deterministic test images.
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, body) {
  const payload = Buffer.concat([Buffer.from(type), body]);
  const size = Buffer.alloc(4);
  size.writeUInt32BE(body.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload));
  return Buffer.concat([size, payload, crc]);
}
function png(width, height, palette) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const data = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = y * (width * 3 + 1) + 1 + x * 3;
      const t = (x / width) * 0.65 + (y / height) * 0.35;
      const band = Math.min(2, Math.floor(t * 3));
      const local = t * 3 - band;
      for (let channel = 0; channel < 3; channel++)
        data[index + channel] = Math.round(
          palette[band][channel] * (1 - local) +
            palette[band + 1][channel] * local,
        );
    }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(data)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
mkdirSync("public/samples", { recursive: true });
mkdirSync("work/fixtures", { recursive: true });
const first = png(960, 640, [
  [26, 39, 108],
  [92, 98, 214],
  [214, 119, 156],
  [255, 209, 122],
]);
const second = png(640, 960, [
  [7, 71, 82],
  [15, 121, 138],
  [123, 197, 171],
  [226, 238, 182],
]);
writeFileSync("public/samples/color-study.png", first);
writeFileSync("work/fixtures/color-study.png", first);
writeFileSync("work/fixtures/sea-study.png", second);
writeFileSync(
  "work/fixtures/corrupt.png",
  Buffer.from("This is not an image."),
);
writeFileSync(
  "work/fixtures/notes.txt",
  "A non-image file for validation testing.",
);
writeFileSync(
  "work/fixtures/too-large.png",
  Buffer.concat([first, Buffer.alloc(2 * 1024 * 1024)]),
);
console.log("Generated one public sample and five local test fixtures.");
