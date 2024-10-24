import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Promise<boolean> {
    const token = this.tokenService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return Promise.resolve(false);
    }

    return this.authService.validateToken(token).then((isValid) => {
      if (!isValid) {
        this.tokenService.clearToken();
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    });
  }
}
