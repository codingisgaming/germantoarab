import { Injectable } from '@angular/core';
import { Bookmark, ReaderPage } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly keys = {
    pages: 'az_pages',
    lastPage: 'az_last_page',
    bookmarks: 'az_bookmarks',
    fontSize: 'az_font_size'
  };

  savePages(pages: ReaderPage[]): void { localStorage.setItem(this.keys.pages, JSON.stringify(pages)); }
  loadPages(): ReaderPage[] { return JSON.parse(localStorage.getItem(this.keys.pages) || '[]'); }
  saveLastPage(page: number): void { localStorage.setItem(this.keys.lastPage, String(page)); }
  loadLastPage(): number { return Number(localStorage.getItem(this.keys.lastPage) || 1); }
  saveBookmarks(bookmarks: Bookmark[]): void { localStorage.setItem(this.keys.bookmarks, JSON.stringify(bookmarks)); }
  loadBookmarks(): Bookmark[] { return JSON.parse(localStorage.getItem(this.keys.bookmarks) || '[]'); }
  saveFontSize(size: number): void { localStorage.setItem(this.keys.fontSize, String(size)); }
  loadFontSize(): number { return Number(localStorage.getItem(this.keys.fontSize) || 18); }
}
