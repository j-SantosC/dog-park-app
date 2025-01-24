import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { TokenService } from '../../services/token.service';
import { CookieService } from '../../services/cookie.service';

@Component({
	selector: 'app-signup',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.scss'],
	standalone: true,
	imports: [ReactiveFormsModule, NgIf, RouterModule],
})
export class SignUpComponent implements OnInit {
	signupForm!: FormGroup;

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private tokenService: TokenService,
		private cookieService: CookieService
	) {}

	ngOnInit(): void {
		this.signupForm = this.formBuilder.group({
			username: ['', [Validators.required, Validators.minLength(3)]],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
		});
		this.cookieService.delete('auth_token');
		this.cookieService.delete('user');
	}

	onSubmit(): void {
		if (this.signupForm.valid) {
			const { email, password, username } = this.signupForm.value;

			this.authService
				.createUser(email, password, username)

				.pipe(switchMap(() => this.authService.login(email, password)))
				.subscribe(
					(user) => {
						this.authService.setUser(user);
						user?.getIdToken().then((token) => {
							this.tokenService.setToken(token);
							this.router.navigate(['/dashboard']);
						});
					},
					(error) => {
						console.error('Error during signup or login:', error);
					}
				);
		}
	}
}
