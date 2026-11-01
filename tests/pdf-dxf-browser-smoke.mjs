import { chromium } from "playwright";

function makeVectorPdf(stream = "0 0 100 100 re S\\nBT /F1 12 Tf 20 120 Td (PAID TEST) Tj ET\\n") {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}endstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  const baseUrl = process.env.PAID_BASE_URL || "http://127.0.0.1:4173/";
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  if (layout.width > layout.viewport + 1) throw new Error("Mobile layout overflows horizontally: " + JSON.stringify(layout));
  await page.locator("#pdf-file").waitFor({ state: "visible" });
  await page.locator("#pdf-convert-button").waitFor({ state: "visible" });
  await page.locator("#pdf-file").setInputFiles({
    name: "paid-vector-smoke-test.pdf",
    mimeType: "application/pdf",
    buffer: makeVectorPdf()
  });
  const downloadPromise = page.waitForEvent("download", { timeout: 30000 }).catch(() => null);
  await page.locator("#pdf-convert-button").click();
  await page.waitForFunction(() => {
    const text = document.querySelector("#pdf-converter-status")?.textContent || "";
    return text.includes("DXF download started") || text.includes("Conversion failed") || text.includes("did not load");
  }, { timeout: 30000 });
  const status = await page.locator("#pdf-converter-status").innerText();
  if (!status.includes("DXF download started")) {
    throw new Error("Browser conversion did not succeed. UI status: " + status + (errors.length ? "; browser errors: " + errors.join("; ") : ""));
  }
  const download = await downloadPromise;
  if (!download) throw new Error("Conversion reported success but no file download event was observed.");
  const path = await download.path();
  const fs = await import("node:fs/promises");
  const dxf = await fs.readFile(path, "utf8");
  if (!dxf.includes("SECTION") || !dxf.includes("ENTITIES")) throw new Error("Downloaded file is not a recognizable DXF; preview: " + dxf.slice(0, 2000));
  const entityStart = dxf.search(/(?:^|\r?\n)2\r?\nENTITIES\r?\n/);
  const entities = entityStart >= 0 ? dxf.slice(entityStart).split(/ENDSEC/)[0] : "";
  const lineCount = (entities.match(/(?:^|\r?\n)0\r?\nLINE\r?\n/g) || []).length;
  const textCount = (entities.match(/(?:^|\r?\n)0\r?\nTEXT\r?\n/g) || []).length;
  if (lineCount < 4) throw new Error("Expected at least 4 LINE entities for the PDF rectangle, found " + lineCount + "; entities preview: " + entities.slice(0, 3000));
  if (textCount < 1) throw new Error("Expected a TEXT entity from the PDF label, found " + textCount + "; entities preview: " + entities.slice(0, 3000));
  // Exercise a second PDF containing a cubic Bezier curve, not just a rectangle.
  await page.locator("#pdf-file").setInputFiles({ name: "paid-curve-smoke-test.pdf", mimeType: "application/pdf", buffer: makeVectorPdf("20 20 m 50 100 100 100 130 20 c S\\nBT /F1 12 Tf 20 120 Td (CURVE TEST) Tj ET\\n") });
  const secondDownloadPromise = page.waitForEvent("download", { timeout: 30000 }).catch(() => null);
  await page.locator("#pdf-convert-button").click();
  await page.waitForFunction(() => { const s = document.querySelector("#pdf-converter-status")?.textContent || ""; return s.includes("DXF download started") || s.includes("Conversion failed") || s.includes("did not load"); }, { timeout: 30000 });
  const secondStatus = await page.locator("#pdf-converter-status").innerText();
  if (!secondStatus.includes("DXF download started")) throw new Error("Curve PDF conversion failed: " + secondStatus);
  const secondDownload = await secondDownloadPromise;
  if (!secondDownload) throw new Error("Curve PDF conversion reported success without a download.");
  const secondPath = await secondDownload.path();
  const curveDxf = await fs.readFile(secondPath, "utf8");
  const curveStart = curveDxf.search(/(?:^|\r?\n)2\r?\nENTITIES\r?\n/);
  const curveEntities = curveStart >= 0 ? curveDxf.slice(curveStart).split(/ENDSEC/)[0] : "";
  const curveLineCount = (curveEntities.match(/(?:^|\r?\n)0\r?\nLINE\r?\n/g) || []).length;
  if (curveLineCount < 1) throw new Error("Curve PDF produced no LINE geometry; entities: " + curveEntities.slice(0, 2000));
  if (errors.length) throw new Error("Browser errors: " + errors.join("; "));
  console.log("Mobile browser conversion succeeded: rectangle PDF emitted " + lineCount + " LINE and " + textCount + " TEXT entities; curve PDF emitted " + curveLineCount + " LINE entities.");
} finally {
  await browser.close();
}
