import { Component, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service'; // Importar el TokenService

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	standalone: true,
	imports: [ReactiveFormsModule, CommonModule, NgIf, RouterModule],
})
export class LoginComponent implements OnInit {
	loginForm: FormGroup;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private authService: AuthService,
		private tokenService: TokenService
	) {
		this.loginForm = this.fb.group({
			email: ['', [Validators.required]],
			password: ['', [Validators.required]],
		});
	}

	ngOnInit(): void {
		const token = this.tokenService.getToken();
		if (token) {
			this.authService
				.validateToken(token)
				.then((isValid) => {
					if (isValid) {
						this.router.navigate([
							'/dashboard',
						]);
					}
				});
		}
	}

	onSubmit() {
		if (this.loginForm.invalid) {
			return;
		}
		const { email, password } = this.loginForm.value;

		this.authService
			.login(email, password)
			.then((user) => {
				if (user) {
					user.getIdToken().then((token) => {
						this.tokenService.setToken(
							token
						);
						this.router.navigate([
							'/dashboard',
						]);
					});
				}
			})
			.catch((error) => {
				console.error(
					'Error durante el inicio de sesión',
					error
				);
			});
	}
}
