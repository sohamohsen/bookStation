import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BorrowedBookResponse } from '../../../../services/models/borrowed-book-response';
import { PageResponseBorrowedBookResponse } from '../../../../services/models/page-response-borrowed-book-response';
import {FeedbackRequest} from '../../../../services/models/feedback-request';
import {FormsModule} from '@angular/forms';
import {Rating} from '../../components/rating/rating';
import {RouterLink} from '@angular/router';
import {BookResponse} from '../../../../services/models/book-response';
import {FeedbackService} from '../../../../services/services/feedback.service';
import {BookControllerService} from '../../../../services/services/book-controller.service';

@Component({
  selector: 'app-borrowed-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Rating],
  templateUrl: './borrowed-book-list.html',
  styleUrl: './borrowed-book-list.scss',
})
export class BorrowedBookList implements OnInit {

  borrowedBooksResponse: PageResponseBorrowedBookResponse | null = null;

  books: BorrowedBookResponse[] = [];
  feedbackRequest: FeedbackRequest = {bookId: 0, comment: "", rating: 0};
  page = 0;
  size = 5;
  totalPages = 0;

  isLoading = false;
  protected selectedBook: BorrowedBookResponse | undefined = undefined ;

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

  // 📨 جلب الكتب المستعارة
  getAllBorrowedBook = (): void => {
    this.isLoading = true;

    const params = new HttpParams()
      .set('page', this.page)
      .set('size', this.size);

    this.http.get<PageResponseBorrowedBookResponse>(
      'http://localhost:8030/api/v1/books/get-borrowed-books',
      { params }
    ).subscribe({
      next: (resp) => {
        console.log('📚 Borrowed books JSON response: ', resp);

        this.borrowedBooksResponse = resp;
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

  // ✅ أرقام الصفحات للـ pagination
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

  // 📌 pagination handlers
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

  returnBorrowedBook(book: BorrowedBookResponse): void {
    this.selectedBook = book;
    this.feedbackRequest.bookId = book.id as number;

  }

  returnBook(withFeedback: boolean) {
    this.bookService.returnBorrowedBook({
      'id': this.selectedBook?.id as number
    }).subscribe({
      next: () => {
        if (withFeedback) {
          this.giveFeedback();
        }
        this.selectedBook = undefined;
        this.getAllBorrowedBook();
      }
    })
  }

  private giveFeedback() {
    this.feedbackService.saveFeedback({
      body: this.feedbackRequest
    }).subscribe({
      next: () => {
    }
    })
  }
}
