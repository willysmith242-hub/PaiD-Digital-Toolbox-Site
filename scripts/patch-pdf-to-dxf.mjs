import fs from "node:fs";
const file = "converter-src/src/core/converter.ts";
const source = fs.readFileSync(file, "utf8");
const supported = "const packed = args[1]?.[0] as ArrayLike<number> | undefined;";
const legacy = "const packed = args[1] as ArrayLike<number> | undefined;";
if (source.includes(supported)) {
  console.log("Upstream converter already contains the PDF.js 6 packed-path argument lookup; no patch required.");
} else if (source.includes(legacy)) {
  throw new Error("Unexpected legacy PDF.js path lookup. Refusing an unverified automatic patch.");
} else {
  throw new Error("Could not verify the upstream PDF.js constructPath implementation.");
}
