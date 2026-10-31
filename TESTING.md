# PaiD Digital Toolbox — Verification Checklist

This checklist distinguishes automated build checks from real user-facing tests. Do not mark a test as passed unless it was actually performed.

## Automated build checks
- [ ] GitHub Actions successfully installs the pinned converter package and Vite.
- [ ] The converter bundle builds and is non-empty.
- [ ] The converter UI and local bundle references are present.
- [ ] The built bundle loads the PDF.js worker from a local asset.

## Manual tests — NOT YET VERIFIED
- [ ] A real browser successfully converts a known vector PDF.
- [ ] The generated DXF opens in a CAD program and its geometry, dimensions, text and scale have been checked.
- [ ] A scanned/image-only PDF fails clearly without producing a misleading result.
- [ ] The PWA installs and opens again with Wi-Fi and mobile data turned off.
- [ ] PDF-to-DXF conversion succeeds offline after the required local assets have been cached.
- [ ] Phone-sized and desktop layouts have both been checked.

## Manual browser test
1. Open the deployed HTTPS site in a supported browser after the converter branch has been reviewed and deployed.
2. Open the homepage and wait for all local assets to finish loading.
3. Open the PDF-to-DXF section and choose a small, non-confidential vector PDF containing a few known lines and dimensions.
4. Convert it and confirm a DXF download starts.
5. Open the DXF in LibreCAD, FreeCAD, AutoCAD, or another compatible CAD program.
6. Compare geometry, text and dimensions with the source PDF. The converter preserves PDF points by default; do not assume the output units are millimetres.
7. Reopen the site while online, install/add it to the home screen if the browser offers that option, and allow the service worker to cache required files.
8. Turn off Wi-Fi and mobile data. Reopen the installed site and test the same sample conversion.
9. Record browser/device, result, errors, and whether each feature worked offline.

## Safety and privacy
Use only sample drawings that you are allowed to share. Do not use confidential employer, client, plant, or construction drawings for testing without authorization. Treat generated DXF files as unverified until checked in CAD. Never use unverified conversion output directly for fabrication, construction, or safety-critical work.

## Reporting results
For each test, record one of: **PASS**, **FAIL**, or **NOT TESTED**. A successful GitHub build is not proof that the converter works in a browser, that its geometry is accurate, or that it works offline.
