import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  set token(token: string) {
    // only run in the browser (no localStorage on server)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  get token(): string | null {
    // only read from localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null; // SSR: no token, but no crash
  }
}
