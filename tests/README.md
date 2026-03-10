# Conversion Tests (Local)

This folder contains local-only conversion verification assets and reports.

## Files
- `scripts_setup_assets.ps1`: Creates input files for all supported input types.
- `run-conversion-matrix.js`: Automates browser conversion tests across all implemented output formats.
- `conversion-test-results.md`: Human-readable matrix report.
- `conversion-test-results.json`: Machine-readable report.
- `assets/input/`: Generated/downloaded input samples.
- `assets/output/`: Generated converted files (ignored by git).

## Run
1. `npm install`
2. `npm run test:assets`
3. `npx playwright install chromium`
4. `npm run test:conversion`

## Notes
- Reports are intentionally kept under `tests/` and not exposed in site UI.
- Results can vary by browser codec support (for example AVIF decode support).
