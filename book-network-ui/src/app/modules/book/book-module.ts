import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Main } from './pages/main/main';
import { BookList } from './pages/book-list/book-list';
import { MyBooks } from './pages/my-books/my-books';
import { MenuComponent } from './components/menu/menu';
import {BookRoutingModule} from './book-routing-module';

@NgModule({
  imports: [
    CommonModule,
    BookRoutingModule,  // 👈 مهم جداً
    Main,               // standalone components
    BookList,
    MyBooks,
    MenuComponent
  ],
})
export class BookModule {}
