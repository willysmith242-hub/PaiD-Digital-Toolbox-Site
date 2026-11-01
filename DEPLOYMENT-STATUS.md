# Deployment status

The public site source is in the `main` branch of `willysmith242-hub/PaiD-Digital-Toolbox-Site`. GitHub Pages deployment is automated by `.github/workflows/deploy-pages.yml`.

## Latest verified deployment

- The PDF-to-DXF converter source and browser bundle build completed successfully.
- The site was uploaded and deployed successfully in GitHub Actions run 41337894997.
- The service worker cache version is `paid-toolbox-public-v3` and its precache list includes the converter bundle and PDF.js worker.
- The homepage contains the PDF-to-DXF converter interface and no longer contains the obsolete notice that the engine is missing.

## Production verification

`.github/workflows/production-pdf-dxf-check.yml` runs a Playwright smoke test against the deployed GitHub Pages URL after successful deployments. It checks a synthetic vector PDF conversion at a phone-sized viewport and inspects the downloaded DXF entities.

A successful build or synthetic smoke test does not prove engineering accuracy. A real user drawing must still be checked in CAD for units, scale, dimensions, text and geometry. Scanned/image-only PDFs may not produce editable geometry.

## Remaining manual checks

- Open a real, non-confidential vector PDF on a phone and confirm conversion/download.
- Open the DXF in compatible CAD software and compare its dimensions and geometry to the source.
- Confirm the installed home-screen app refreshes its service worker and opens offline.
- Confirm PDF-to-DXF conversion works offline after all required assets have been cached.
