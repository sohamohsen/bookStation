import {Component, Input, AfterViewInit, ChangeDetectorRef, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookResponse } from '../../../../services/models/book-response';
import {Rating} from '../rating/rating';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, Rating],
  templateUrl: './book-card.html',
  styleUrls: ['./book-card.scss'],
})
export class BookCard implements AfterViewInit {

  @Input() book!: BookResponse;
  @Input() manage!:boolean;   // 👈 هُنا
  imageLoaded = false;
  private _manage = false;
  private _bookCover: string | undefined;

  constructor(private _cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    // Give images a moment to render
    setTimeout(() => {
      this.imageLoaded = true;
      this._cdr.detectChanges();
    }, 100);
  }

  get bookCover(): string {
    if (this.book?.cover) {
      return this.book.cover;
    }
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';
  }

  @Output() private share: EventEmitter<BookResponse> = new EventEmitter<BookResponse>();
  @Output() private archive: EventEmitter<BookResponse> = new EventEmitter<BookResponse>();
  @Output() private addToWaitingList: EventEmitter<BookResponse> = new EventEmitter<BookResponse>();
  @Output() private borrow: EventEmitter<BookResponse> = new EventEmitter<BookResponse>();
  @Output() private edit: EventEmitter<BookResponse> = new EventEmitter<BookResponse>();
  @Output() private details: EventEmitter<BookResponse> = new EventEmitter<BookResponse>();

  onEdit() {
    this.edit.emit(this.book);
  }

  onShowDetails() {
    this.details.emit(this.book);
  }

  onBorrow() {
    this.borrow.emit(this.book);

  }

  onAddToWaitingList() {
    this.addToWaitingList.emit(this.book);
  }

  onShare() {
    this.share.emit(this.book);
  }

  onArchive() {
    this.archive.emit(this.book);
  }
}
