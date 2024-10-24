import { Injectable } from '@angular/core';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private cookieService: CookieService) {}

  setToken(token: string): void {
    const expirationDays = 1;
    const secure = true;
    this.cookieService.set('auth_token', token, expirationDays, secure);
  }

  getToken(): string | null {
    return this.cookieService.get('auth_token');
  }

  clearToken(): void {
    this.cookieService.delete('auth_token');
  }
}
