import { chromium } from "playwright";

function makeVectorPdf() {
  const stream = "0 0 m 100 0 l 100 100 l 0 100 l h S\nBT /F1 12 Tf 20 120 Td (PAID TEST) Tj ET\n";
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
  const page = await browser.newPage({ acceptDownloads: true });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.locator("#pdf-file").setInputFiles({
    name: "paid-vector-smoke-test.pdf",
    mimeType: "application/pdf",
    buffer: makeVectorPdf()
  });
  await page.locator("#pdf-convert-button").click();
  await page.getByText(/DXF download started\./).waitFor({ timeout: 30000 });
  const downloadPromise = page.waitForEvent("download");
  // Conversion may already have triggered; use status plus download event where available.
  const status = await page.locator("#pdf-converter-status").innerText();
  if (!status.includes("DXF download started")) throw new Error("Conversion status did not report success: " + status);
  if (errors.length) throw new Error("Browser errors: " + errors.join("; "));
  console.log("Browser smoke conversion succeeded: " + status);
} finally {
  await browser.close();
}
