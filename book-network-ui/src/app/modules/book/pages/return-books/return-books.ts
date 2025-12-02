import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgForOf, NgIf} from '@angular/common';
import {PageResponseBorrowedBookResponse} from '../../../../services/models/page-response-borrowed-book-response';
import {BorrowedBookResponse} from '../../../../services/models/borrowed-book-response';
import {BookControllerService} from '../../../../services/services/book-controller.service';
import {FeedbackService} from '../../../../services/services/feedback.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {returnBorrowedBook} from '../../../../services/fn/book-controller/return-borrowed-book';
import {approveReturnBorrowedBook} from '../../../../services/fn/book-controller/approve-return-borrowed-book';

@Component({
  selector: 'app-return-books',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './return-books.html',
  styleUrls: ['./return-books.scss'],
})
export class ReturnBooks implements OnInit {
  returnedBooks: PageResponseBorrowedBookResponse | null = null;

  books: BorrowedBookResponse[] = [];
  page = 0;
  size = 5;
  totalPages = 0;

  isLoading = false;

  constructor(
    private bookService: BookControllerService,
    private feedbackService: FeedbackService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getAllBorrowedBook();
    }
  }

  getAllBorrowedBook = (): void => {
    this.isLoading = true;

    const params = new HttpParams()
      .set('page', this.page)
      .set('size', this.size);

    this.http.get<PageResponseBorrowedBookResponse>(
      'http://localhost:8030/api/v1/books/get-returned-books',
      { params }
    ).subscribe({
      next: (resp) => {
        console.log('📚 Returned books JSON response: ', resp);

        this.returnedBooks = resp;
        this.books = resp.content ?? [];
        this.totalPages = resp.totalPages ?? 0;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error while fetching borrowed books', err);
        this.isLoading = false;
      }
    });
  };

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  get isFirstPage(): boolean {
    return this.page === 0;
  }

  get isLastPage(): boolean {
    if (this.totalPages === 0) return true;
    return this.page >= this.totalPages - 1;
  }

  gotToFirstPage(): void {
    if (this.isFirstPage || this.isLoading) return;
    this.page = 0;
    this.getAllBorrowedBook();
  }

  gotToPreviousPage(): void {
    if (this.isFirstPage || this.isLoading) return;
    this.page--;
    this.getAllBorrowedBook();
  }

  gotToPage(index: number): void {
    if (this.isLoading) return;
    if (index < 0 || index >= this.totalPages || index === this.page) return;
    this.page = index;
    this.getAllBorrowedBook();
  }

  gotToNextPage(): void {
    if (this.isLastPage || this.isLoading) return;
    this.page++;
    this.getAllBorrowedBook();
  }

  gotToLastPage(): void {
    if (this.isLoading) return;
    if (this.totalPages === 0 || this.isLastPage) return;
    this.page = this.totalPages - 1;
    this.getAllBorrowedBook();
  }

  protected readonly returnBorrowedBook = returnBorrowedBook;
  protected readonly approveReturnBorrowedBook = approveReturnBorrowedBook;

  approveBookReturn(book: BorrowedBookResponse) {

  }
}
