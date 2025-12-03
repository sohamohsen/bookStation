import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ActivateAccount } from './pages/activate-account/activate-account';
import {authGuard} from './services/guard/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'activate', component: ActivateAccount },
  {
    path: 'books',
    loadChildren: () =>
      import('./modules/book/book-module').then(m => m.BookModule)
  },
  {
    path: 'books',
    loadChildren: () =>
      import('./modules/book/book-module').then(m => m.BookModule),
    canActivate: [authGuard]
  }
];
