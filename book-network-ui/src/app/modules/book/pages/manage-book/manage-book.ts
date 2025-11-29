import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BookControllerService } from '../../../../services/services/book-controller.service';
import { BookRequest } from '../../../../services/models/book-request';

@Component({
  selector: 'app-manage-book',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-book.html',
  styleUrls: ['./manage-book.scss'],
})
export class ManageBook implements OnInit {
  errorMsg: string[] = [];
  selectedPicture?: string;
  selectedBookCover?: File;
  readonly defaultImage =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

  bookRequest: BookRequest = {
    author: '',
    isbn: '',
    synopsis: '',
    title: '',
    shareable: false,
  };

  constructor(
    private bookService: BookControllerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('route params = ', this.activatedRoute.snapshot.params);

    // هنا نقرأ book_id من الراوتر
    const idParam =
      this.activatedRoute.snapshot.paramMap.get('book_id') ||
      this.activatedRoute.snapshot.paramMap.get('bookId') ||
      this.activatedRoute.snapshot.paramMap.get('id');

    console.log('idParam =', idParam);

    if (!idParam) {
      console.log('No id → create mode (empty form)');
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      console.error('Invalid id value:', idParam);
      return;
    }

    console.log('Final numeric id =', id);

    this.bookService.getBookById({ id }).subscribe({
      next: (book: any) => {
        console.log('getBookById response =', book);

        const actualBook = book?.data ?? book;

        this.bookRequest = {
          id: actualBook.id,
          title: actualBook.title ?? '',
          author: actualBook.author ?? '',
          isbn: actualBook.isbn ?? '',
          synopsis: actualBook.synopsis ?? '',
          shareable: actualBook.shareable ?? false,
        };

        const cover = actualBook.bookCover ?? actualBook.cover;
        if (cover) {
          this.selectedPicture = cover.startsWith('data:')
            ? cover
            : 'data:image/jpeg;base64,' + cover;
        }
      },
      error: (err) => {
        console.error('getBookById error', err);
        this.errorMsg = ['Could not load book data'];
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedBookCover = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedPicture = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveBook(): void {
    this.errorMsg = [];

    this.bookService.addBook({ body: this.bookRequest }).subscribe({
      next: (created: any) => {
        console.log('addBook raw response = ', created);

        const handlePayload = (payload: any) => {
          const bookIdRaw = payload?.id ?? payload;
          console.log('bookIdRaw =', bookIdRaw, 'typeof=', typeof bookIdRaw);

          const idAsNumber = Number(bookIdRaw);
          console.log('idAsNumber =', idAsNumber);

          if (!idAsNumber || isNaN(idAsNumber)) {
            this.errorMsg = ['Could not get book id from server'];
            return;
          }

          if (!this.selectedBookCover) {
            // مفيش صورة → اكتفي بتسجيل الكتاب وارجع للـ my-books
            this.router.navigate(['/books/my-books']);
            return;
          }

          console.log('Uploading cover for book', idAsNumber, 'file =', this.selectedBookCover);

          this.bookService
            .uploadCoverManual(idAsNumber, this.selectedBookCover!)
            .subscribe({
              next: () => this.router.navigate(['/books/my-books']),
              error: (err) => {
                console.error('upload cover error', err);
                this.errorMsg = ['Error uploading book cover'];
              },
            });
        };

        // لو الـ API رجّع Blob (وده اللي حصل معاك)
        if (created instanceof Blob) {
          created.text().then((text: string) => {
            console.log('addBook blob text =', text);
            let payload: any = text;
            try {
              payload = text ? JSON.parse(text) : null;
            } catch {
              // لو رجّع رقم بس "57" هيفضل string
              payload = text;
            }
            handlePayload(payload);
          });
        } else {
          handlePayload(created);
        }
      },
      error: (err) => {
        console.error('addBook error', err);
        this.errorMsg = err.error?.validation ?? ['Something went wrong'];
      },
    });
  }
}
