import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


// Standalone components → must be imported, NOT declared
import { Main } from './pages/main/main';
import { BookList } from './pages/book-list/book-list';
import { MyBooks } from './pages/my-books/my-books';
import { ManageBook } from './pages/manage-book/manage-book';
import { MenuComponent } from './components/menu/menu';
import { BookCard } from './components/book-card/book-card';
import {BookRoutingModule} from './book-routing-module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BookRoutingModule,

    // ⭐ Standalone components هنا
    Main,
    BookList,
    MyBooks,
    ManageBook,
    MenuComponent,
    BookCard,
  ],
})
export class BookModule {}
