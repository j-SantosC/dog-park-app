import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from '@angular/fire/auth';
import { NgIf } from '@angular/common';
import { TokenService } from './services/token.service';
import { CookieService } from './services/cookie.service';
import { ButtonComponent } from './components/button/button.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, NgIf, ButtonComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	title = 'dog-park-app';

	user: User | null = null;

	constructor(
		private authService: AuthService,
		private router: Router,
		private tokenService: TokenService,
		private cookieService: CookieService
	) {}

	async ngOnInit() {
		try {
			this.authService.user$.subscribe((user) => (this.user = user));

			const token = await this.authService.getToken();
			if (token) {
				this.tokenService.setToken(token);
			}

			const userCookie = this.cookieService.get('user');
			if (userCookie) {
				const user = JSON.parse(userCookie);
				this.authService.setUser(user);
			}
		} catch (error) {
			console.error('Error during initialization:', error);
		}
	}

	logout(): Promise<void> {
		return this.authService.logout().then(() => {
			this.authService.updateUser(null);
			this.tokenService.clearToken();
			this.router.navigate(['/login']);
		});
	}
}
