import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bookmark, ReaderPage } from './models/page.model';
import { PdfReaderService } from './services/pdf-reader.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  pages = signal<ReaderPage[]>([]);
  currentPage = signal(1);
  query = signal('');
  fontSize = signal(this.storage.loadFontSize());
  bookmarks = signal<Bookmark[]>(this.storage.loadBookmarks());
  pageJump = 1;
  loading = signal(false);
  hasData = signal(false);

  current = computed(() => this.pages().find((p) => p.pageNumber === this.currentPage()));
  progress = computed(() => (this.pages().length ? Math.round((this.currentPage() / this.pages().length) * 100) : 0));

  constructor(private pdfService: PdfReaderService, private storage: StorageService) {}

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    const cached = this.storage.loadPages();
    if (cached.length) {
      this.pages.set(cached);
      this.hasData.set(true);
    }
    this.currentPage.set(this.storage.loadLastPage());
    this.pageJump = this.currentPage();
    this.loading.set(false);
  }



  async onPdfSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.loading.set(true);
    const extracted = await this.pdfService.extractBilingualPagesFromFile(file);
    this.pages.set(extracted);
    this.hasData.set(true);
    this.goToPage(1);
    this.storage.savePages(extracted);
    this.loading.set(false);
  }

  next(): void { if (this.currentPage() < this.pages().length) this.goToPage(this.currentPage() + 1); }
  prev(): void { if (this.currentPage() > 1) this.goToPage(this.currentPage() - 1); }
  goToPage(page: number): void {
    const target = Math.min(Math.max(1, page), this.pages().length);
    this.currentPage.set(target);
    this.pageJump = target;
    this.storage.saveLastPage(target);
  }
  continueReading(): void { this.goToPage(this.storage.loadLastPage()); }
  setFont(delta: number): void {
    const next = Math.min(32, Math.max(14, this.fontSize() + delta));
    this.fontSize.set(next);
    this.storage.saveFontSize(next);
  }

  addBookmark(): void {
    if (this.bookmarks().some((b) => b.pageNumber === this.currentPage())) return;
    const updated = [...this.bookmarks(), { pageNumber: this.currentPage(), createdAt: new Date().toISOString() }];
    this.bookmarks.set(updated);
    this.storage.saveBookmarks(updated);
  }

  filteredBookmarks(): Bookmark[] {
    return this.bookmarks().sort((a, b) => a.pageNumber - b.pageNumber);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }
}
