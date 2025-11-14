import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import type { AuthenticationRequest } from '../../services/models/authentication-request';
import { AuthenticationService } from '../../services/services/authentication.service';
import type { AuthenticationResponse } from '../../services/models/authentication-response';
import { TokenService } from '../../services/token/token.service';
import { of, from } from 'rxjs';
import { switchMap, map, take, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  authRequest: AuthenticationRequest = { email: '', password: '' };
  errorMsg: string[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private tokenService: TokenService
  ) {}

  login() {
    if (this.isLoading) return;

    this.errorMsg = [];
    this.isLoading = true;

    this.authService
      .authenticate({ body: this.authRequest })
      .pipe(
        take(1),
        switchMap((res: any) => {
          // 🔹 من الـdebug: الريسبونس دايمًا Blob فيه JSON
          if (res instanceof Blob) {
            return from(res.text()).pipe(
              map((t) => JSON.parse(t) as AuthenticationResponse)
            );
          }
          // في أي حالة تانية (لو اتغيرت الإعدادات لاحقًا)
          return of(res as AuthenticationResponse);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (json: AuthenticationResponse | any) => {
          console.log('Parsed auth JSON:', json);

          const token = json?.token ?? null;

          if (!token) {
            this.errorMsg = ['Login succeeded but token was missing in response.'];
            return;
          }

          this.tokenService.token = token;

          // ✅ لو عندك route 'books' متعرف، سيبيه
          // لو لأ، استخدمي '/' مؤقتًا
          this.router.navigateByUrl('/books');
          // this.router.navigateByUrl('/');  // بديل
        },
        error: (err: any) => {
          console.log('Auth error:', err);
          if (err?.error?.validationErrors?.length) {
            this.errorMsg = err.error.validationErrors;
          } else if (typeof err?.error === 'string') {
            this.errorMsg = [err.error];
          } else if (err?.error?.message) {
            this.errorMsg = [err.error.message];
          } else {
            this.errorMsg = ['Login failed. Please check your credentials and try again.'];
          }
        },
      });
  }

  register() {
    this.router.navigate(['register']);
  }
}
