# Ardh Zekola Bilingual Reader (Angular)

Offline-first Angular app for reading **Ardh Zekola** in Arabic + German side by side.

## Features
- PDF ingestion and page extraction in-browser (no backend).
- Bilingual reader layout (Arabic left, German right).
- Dark premium UI, responsive for mobile/desktop.
- Local persistence with LocalStorage:
  - extracted pages
  - last opened page
  - bookmarks
  - font size
- Continue Reading, page jump, prev/next navigation.
- Reading progress percentage.
- Keyboard shortcuts:
  - `ArrowLeft`: previous page
  - `ArrowRight`: next page

## Setup
```bash
npm install
npm start
```
Then open `http://localhost:4200`.

## Build
```bash
npm run build
```

## PDF Source (No Binary in Repo)
- Use the upload button in the app to load your local Ardh Zekola PDF.
- The app extracts pages in-browser and caches them in LocalStorage.
- On next visit, cached pages load automatically without re-upload.

## Sample Local JSON Structure
See:
- `sample-data/pages.sample.json`

## Notes
- The initial Arabic/German split uses a heuristic from page text lines. If the source PDF has a specific structure, update `PdfReaderService` splitting logic for perfect alignment.
- After first extraction, content is served from local cache and works offline.
