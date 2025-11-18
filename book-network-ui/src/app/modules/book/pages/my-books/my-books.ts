import {ChangeDetectorRef, Component, Inject, PLATFORM_ID} from '@angular/core';
import {PageResponseBookResponse} from '../../../../services/models/page-response-book-response';
import {BookControllerService} from '../../../../services/services/book-controller.service';
import {Router} from '@angular/router';
import {isPlatformBrowser, NgForOf, NgIf} from '@angular/common';
import {BookResponse} from '../../../../services/models/book-response';
import {BookCard} from '../../components/book-card/book-card';

type BookLite = { id?: number; title?: string };

@Component({
  selector: 'app-my-books',
  imports: [
    BookCard,
    NgForOf,
    NgIf
  ],
  templateUrl: './my-books.html',
  styleUrl: './my-books.scss',
})
export class MyBooks {
  bookResponse: PageResponseBookResponse | null = null;
  page = 0;
  size = 4;
  isLoading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookService: BookControllerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.findAllBooks();
    }
  }

  get books(): BookLite[] {
    const br: any = this.bookResponse;
    return (br?.content ?? br?.data?.content ?? []) as BookLite[];
  }

  get pages(): number[] {
    const total = this.bookResponse?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }

  get isFirstPage(): boolean {
    return this.page === 0;
  }

  get isLastPage(): boolean {
    if (this.bookResponse?.last !== undefined) {
      return this.bookResponse.last;
    }
    const totalPages = this.bookResponse?.totalPages ?? 0;
    if (totalPages === 0) return true;
    return this.page >= totalPages - 1;
  }

  trackById(index: number, book: BookLite): number | undefined {
    return book?.id ?? index;
  }

  private findAllBooks(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    console.log('📄 Loading page:', this.page);

    this.bookService.getAllOwnerBooks({ page: this.page, size: this.size }).subscribe({
      next: async (res: PageResponseBookResponse | Blob | any) => {
        if (res instanceof Blob) {
          try {
            const text = await res.text();
            const json = text ? JSON.parse(text) : null;
            this.bookResponse = json as PageResponseBookResponse | null;

            // ✅ Add detailed logging
            console.log('📊 Full Response:', this.bookResponse);
            console.log('📄 Total Pages:', this.bookResponse?.totalPages);
            console.log('📦 Total Elements:', this.bookResponse?.totalElements);
            console.log('🔢 Page Size:', this.bookResponse?.size);
            console.log('✅ Is Last:', this.bookResponse?.last);
            console.log('✅ Is First:', this.bookResponse?.first);

            console.table(this.bookResponse?.content ?? []);
          } catch (e) {
            console.error('❌ Failed to parse Blob as JSON:', e);
            this.bookResponse = null;
          }
        } else {
          this.bookResponse = res as PageResponseBookResponse;

          // ✅ Add detailed logging
          console.log('📊 Full Response:', this.bookResponse);
          console.log('📄 Total Pages:', this.bookResponse?.totalPages);
          console.log('📦 Total Elements:', this.bookResponse?.totalElements);
          console.log('🔢 Page Size:', this.bookResponse?.size);
          console.log('✅ Is Last:', this.bookResponse?.last);
          console.log('✅ Is First:', this.bookResponse?.first);

          console.table(this.bookResponse?.content ?? []);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading books:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
  gotToFirstPage(): void {
    if (this.isFirstPage || this.isLoading) return;
    this.page = 0;
    this.findAllBooks();
  }

  gotToPreviousPage(): void {
    if (this.isFirstPage || this.isLoading) return;
    this.page--;
    this.findAllBooks();
  }

  gotToPage(index: number): void {
    if (this.isLoading) return;
    const totalPages = this.bookResponse?.totalPages ?? 0;
    if (index < 0 || index >= totalPages || index === this.page) return;
    this.page = index;
    this.findAllBooks();
  }

  gotToNextPage(): void {
    if (this.isLastPage || this.isLoading) return;
    this.page++;
    this.findAllBooks();
  }

  gotToLastPage(): void {
    if (this.isLoading) return;
    const totalPages = this.bookResponse?.totalPages ?? 0;
    if (totalPages === 0 || this.isLastPage) return;
    this.page = totalPages - 1;
    this.findAllBooks();
  }

  archiveBook(book: BookResponse) {

  }

  shareBook(book: BookResponse) {

  }

  editBook(book: BookResponse) {

  }
}
