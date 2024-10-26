import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from '@angular/fire/auth';
import { NgIf } from '@angular/common';
import { TokenService } from './services/token.service';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, NgIf],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	title = 'dog-park-app';

	user: User | null = null;

	constructor(
		private authService: AuthService,
		private router: Router,
		private tokenService: TokenService
	) {}

	ngOnInit() {
		this.authService.user$.subscribe((user) => {
			this.user = user;
		});
	}

	logout(): Promise<void> {
		return this.authService.logout().then(() => {
			this.authService.updateUser(null);
			this.tokenService.clearToken();
			this.router.navigate(['/login']);
		});
	}
}
