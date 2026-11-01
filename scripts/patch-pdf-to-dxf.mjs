import fs from "node:fs";

const file = "converter-src/src/core/converter.ts";
let source = fs.readFileSync(file, "utf8");
const broken = `            const packed = args[1]?.[0] as ArrayLike<number> | undefined;
            if (packed) {
              const { ops, coords } = unpackPath(packed);
              processConstructPath(ops, coords, writer, opts.scale);
            }`;
const fixed = `            const packed = args[1] as ArrayLike<number> | undefined;
            if (packed && typeof packed.length === "number") {
              const { ops, coords } = unpackPath(packed);
              processConstructPath(ops, coords, writer, opts.scale);
            }`;
if (source.includes(fixed)) {
  console.log("PDF.js 6 packed-path handling is already corrected.");
} else if (source.includes(broken)) {
  source = source.replace(broken, fixed);
  fs.writeFileSync(file, source);
  console.log("Corrected PDF.js 6 packed-path handling.");
} else {
  throw new Error("Could not safely locate the expected PDF.js packed-path block; upstream source may have changed.");
}
