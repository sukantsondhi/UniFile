# UniFile - Offline Browser File Converter

<p align="center">
  <img src="https://img.shields.io/badge/Privacy-100%25%20Offline-green?style=for-the-badge" alt="100% Offline">
  <img src="https://img.shields.io/badge/Platform-All%20Devices-blue?style=for-the-badge" alt="All Platforms">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
</p>

UniFile is a privacy-first file converter that runs fully in your browser.
No uploads, no server processing, no tracking.

Live Demo: https://unifile.sukantsondhi.com

## What It Supports

### Image conversion
- Inputs: `png`, `jpg`, `jpeg`, `webp`, `gif`, `bmp`, `ico`, `svg`, `heic`, `heif`
- Outputs: `png`, `jpg`, `webp`, `gif`, `bmp`, `ico`, `pdf`
- Notes:
  - `heic`/`heif` requires `heic2any` in-browser support.
  - Image outputs shown in UI are filtered by your browser's actual canvas encoder support.

### Document conversion (text-based)
- Inputs: `txt`, `md`, `html`, `htm`, `rtf`, `csv`, `tsv`, `json`, `xml`
- Outputs: `pdf`, `txt`, `html`, `md`

### Merge mode
- Merge images, text-based documents, and PDFs into one PDF.
- PDF is supported in merge mode (not in convert mode).

## Privacy-focused behavior
- Processing stays on-device in browser memory.
- Optional auto-clear setting removes queued files from memory after save.
- Multi-file outputs can be saved directly to a user-selected folder (File System Access API).
- If folder save is unavailable, output falls back to one ZIP file.

## Quick Start

```bash
git clone https://github.com/Sukantsondhi/UniFile.git
cd UniFile
python -m http.server 8000
```

Open `http://localhost:8000`.

## Tech
- Vanilla JavaScript
- PDF-Lib
- PDF.js
- heic2any
- Showdown
- JSZip
- Canvas API

## Local Test Matrix
- Generate test assets: `npm run test:assets`
- Install browser for automation: `npx playwright install chromium`
- Run conversion matrix: `npm run test:conversion`
- Reports are written to:
  - `tests/conversion-test-results.md`
  - `tests/conversion-test-results.json`

## License
MIT. See [LICENSE](LICENSE).
