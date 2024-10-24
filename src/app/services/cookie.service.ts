import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  set(name: string, value: string, days: number, secure: boolean): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const secureFlag = secure ? '; Secure' : '';
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict${secureFlag}`;
  }

  get(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  }

  delete(name: string): void {
    document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Strict`;
  }
}
