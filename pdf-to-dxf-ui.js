(() => {
  const input = document.getElementById("pdf-file");
  const convertButton = document.getElementById("pdf-convert-button");
  const includeText = document.getElementById("pdf-include-text");
  const status = document.getElementById("pdf-converter-status");
  if (!input || !convertButton || !status) return;

  let selectedFile = null;
  const setStatus = (message, state = "info") => {
    status.textContent = message;
    status.dataset.state = state;
    status.setAttribute("role", state === "error" ? "alert" : "status");
  };

  input.addEventListener("change", () => {
    selectedFile = input.files && input.files[0] ? input.files[0] : null;
    convertButton.disabled = !selectedFile;
    if (!selectedFile) {
      setStatus("Choose a PDF drawing to begin.");
      return;
    }
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      selectedFile = null;
      input.value = "";
      convertButton.disabled = true;
      setStatus("Please choose a PDF file.", "error");
      return;
    }
    setStatus("Selected: " + selectedFile.name + ". Files are processed in this browser; they are not uploaded.");
  });

  convertButton.addEventListener("click", async () => {
    if (!selectedFile) {
      setStatus("Choose a PDF file first.", "error");
      return;
    }
    const engine = window.PaiDPdfToDxf && window.PaiDPdfToDxf.convertPdfToDxf;
    if (typeof engine !== "function") {
      setStatus("The local conversion engine did not load. Refresh the page or try again later.", "error");
      return;
    }
    convertButton.disabled = true;
    setStatus("Converting PDF locally. Large drawings may take a little time…");
    try {
      const buffer = await selectedFile.arrayBuffer();
      const result = await engine(buffer, { includeText: includeText ? includeText.checked : true, includePaths: true });
      if (!result || typeof result.dxf !== "string" || !result.dxf.includes("SECTION") || result.dxf.length < 40) {
        throw new Error("The converter did not return a valid-looking DXF file.");
      }
      const blob = new Blob([result.dxf], { type: "application/dxf;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedFile.name.replace(/\.pdf$/i, "") + ".dxf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      const warningText = result.warnings && result.warnings.length ? " Warnings: " + result.warnings.join(" ") : "";
      setStatus("DXF download started. Pages processed: " + result.pageCount + "." + warningText + " Check units, scale, dimensions and geometry in CAD before use.", "success");
    } catch (error) {
      setStatus("Conversion failed: " + (error && error.message ? error.message : String(error)) + " Scanned/image-only PDFs may not contain editable vector geometry.", "error");
    } finally {
      convertButton.disabled = !selectedFile;
    }
  });
})();
