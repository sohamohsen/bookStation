import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';


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

  isTokenNotValid() {
    return !this.isTokenValid();
  }

  private isTokenValid(): boolean {
    const token = this.token;
    if (!token) return false;

    const jwtHelper = new JwtHelperService();
    const isExpired = jwtHelper.isTokenExpired(token);

    if (isExpired) {
      localStorage.clear();
      return false;
    }

    return true;
  }
}
