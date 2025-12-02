import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, NgForOf, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { PageResponseBookResponse } from '../../../../services/models/page-response-book-response';
import { BookControllerService } from '../../../../services/services/book-controller.service';
import { BookResponse } from '../../../../services/models/book-response';

import { BookCard } from '../../components/book-card/book-card';

type BookLite = { id?: number; title?: string };

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIf,
    NgForOf,
    BookCard,     // 👈 أهم خطوة
  ],
  templateUrl: './my-books.html',
  styleUrls: ['./my-books.scss'],
})
export class MyBooks implements OnInit {
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

    this.bookService.getAllOwnerBooks({ page: this.page, size: this.size }).subscribe({
      next: async (res: PageResponseBookResponse | Blob | any) => {
        if (res instanceof Blob) {
          const text = await res.text();
          this.bookResponse = text ? JSON.parse(text) : null;
        } else {
          this.bookResponse = res;
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
    this.bookService.updateBookArchiveStatus({
      id:book.id as number
    }).subscribe({
      next: () => {
        book.archived = !book.archived;
      }
    })
  }
  shareBook(book: BookResponse) {
    if (!book.id) {
      console.error('Book has no id');
      return;
    }

    this.bookService.updateBookShareableStatus({ id: book.id }).subscribe({
      next: () => {
        book.shareable = !book.shareable;
        console.log('after toggle shareable = ', book.shareable);
      },
      error: (err) => {
        console.error('updateBookShareableStatus error', err);
      }
    });
  }


  editBook(book: BookResponse) {
    console.log('edit', book);
    this.router.navigate(['/books/manage', book.id]);
  }
}
