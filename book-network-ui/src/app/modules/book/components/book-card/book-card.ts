import {
  Component,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookResponse } from '../../../../services/models/book-response';
import { Rating } from '../rating/rating';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, Rating],
  templateUrl: './book-card.html',
  styleUrls: ['./book-card.scss'],
})
export class BookCard implements AfterViewInit {

  @Input() book!: BookResponse;
  @Input() manage: boolean = false;

  imageLoaded = false;

  // صورة افتراضية
  readonly defaultImage =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

  constructor(private _cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.imageLoaded = true;
      this._cdr.detectChanges();
    }, 100);
  }

  // ✅ هنا بنجهز الـ src صح
  get bookCover(): string {
    // بعض الـ APIs ممكن ترجع bookCover أو cover
    const cover = (this.book as any)?.bookCover ?? this.book?.cover;

    if (!cover) {
      return this.defaultImage;
    }

    // لو الـ string أصلاً فيها data:... سيبيها زي ما هي
    if (cover.startsWith('data:')) {
      return cover;
    }

    // أغلب الصور Base64 JPEG (بتبدأ بـ /9j/), فبنضيف الـ prefix
    return `data:image/jpeg;base64,${cover}`;
  }

  @Output() private share = new EventEmitter<BookResponse>();
  @Output() private archive = new EventEmitter<BookResponse>();
  @Output() private addToWaitingList = new EventEmitter<BookResponse>();
  @Output() private borrow = new EventEmitter<BookResponse>();
  @Output() private edit = new EventEmitter<BookResponse>();
  @Output() private details = new EventEmitter<BookResponse>();

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
