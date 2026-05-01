import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { ReaderPage } from '../models/page.model';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url
).toString();

@Injectable({ providedIn: 'root' })
export class PdfReaderService {
  async extractBilingualPagesFromFile(file: File): Promise<ReaderPage[]> {
    const bytes = await file.arrayBuffer();
    return this.extractBilingualPagesFromData(bytes);
  }

  async extractBilingualPagesFromData(data: ArrayBuffer): Promise<ReaderPage[]> {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
    const pdf = await loadingTask.promise;
    const pages: ReaderPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join('\n');
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const midpoint = Math.ceil(lines.length / 2);

      pages.push({
        pageNumber: i,
        arabic: lines.slice(0, midpoint).join(' '),
        german: lines.slice(midpoint).join(' ')
      });
    }

    return pages;
  }
}
