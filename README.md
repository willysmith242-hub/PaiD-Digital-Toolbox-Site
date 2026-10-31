# PaiD Digital Toolbox — Public Website

**PaiD Tools for all.**

This repository contains the public website version of PaiD Digital Toolbox. The original private project and its backup are kept separate.

## Current contents
- Mobile-friendly toolbox homepage
- Search and category filters
- Unit converter and percentage calculator
- Offline guide and software library
- Third-party resources linked to their official websites
- PDF-to-DXF beta interface and a build step that bundles the converter locally

## PDF-to-DXF status
The feature is being integrated on the separate `feature/pdf-dxf-engine` branch. The build workflow installs the open-source `pdf-to-dxf` package and bundles the engine and its PDF worker as local website assets. This is intended to avoid uploading selected drawings to a conversion service.

A successful bundle build does **not** prove the converter works correctly in a browser or that the output is accurate. The converter is not considered verified until a real vector PDF is converted, the DXF opens in CAD, and scale/geometry are checked. Scanned/image-only PDFs may not contain extractable vector paths.

## Publish with GitHub Pages
In this repository, open **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, then save. GitHub should display the published URL after deployment completes.

## Privacy and safety
PaiD does not promise third-party tools are free forever. Review the terms and privacy practices of external services before uploading sensitive files. Use official software sources and verify engineering drawings before use.
