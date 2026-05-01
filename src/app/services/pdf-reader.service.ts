import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { ReaderPage } from '../models/page.model';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url
).toString();

type TextItem = {
  str: string;
  transform: number[];
};

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
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const textItems = content.items.filter((x: any) => 'str' in x) as TextItem[];

      const { arabic, german, wholePage } = this.extractColumns(textItems, viewport.width);

      pages.push({
        pageNumber: i,
        // Keep full content on both sides when only one language exists in the PDF page.
        arabic: arabic || wholePage,
        german: german || wholePage
      });
    }

    return pages;
  }

  private extractColumns(items: TextItem[], pageWidth: number): { arabic: string; german: string; wholePage: string } {
    const lines = items
      .map((item) => ({
        text: item.str.trim(),
        x: item.transform[4] ?? 0,
        y: item.transform[5] ?? 0
      }))
      .filter((item) => item.text.length > 0)
      .sort((a, b) => (Math.abs(b.y - a.y) < 2 ? a.x - b.x : b.y - a.y));

    const divider = pageWidth / 2;
    const left = lines.filter((l) => l.x < divider).map((l) => l.text);
    const right = lines.filter((l) => l.x >= divider).map((l) => l.text);

    // Arabic on the LEFT and German on the RIGHT per requested layout.
    const arabic = left.join('\n');
    const german = right.join('\n');
    const wholePage = lines.map((l) => l.text).join('\n');

    return { arabic, german, wholePage };
  }
}
