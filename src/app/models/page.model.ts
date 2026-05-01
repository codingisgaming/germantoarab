export interface ReaderPage {
  pageNumber: number;
  arabic: string;
  german: string;
}

export interface Bookmark {
  pageNumber: number;
  note?: string;
  createdAt: string;
}
