import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { config } from '../../../config';
import { CookieService } from './cookie.service';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
	public user$: Observable<User | null> = this.userSubject.asObservable();

	constructor(
		//TODO: review this public
		public auth: Auth,
		private http: HttpClient,
		private cookieService: CookieService
	) {}

	apiUrl = config.apiUrl;

	createUser(email: string, password: string, username: string): Observable<any> {
		const body = { email, password, username };
		return this.http.post(`${this.apiUrl}/create-user`, body);
	}

	login(email: string, password: string): Promise<User | null> {
		return signInWithEmailAndPassword(this.auth, email, password)
			.then((userCredential) => {
				const user = userCredential.user;
				this.userSubject.next(user);
				this.cookieService.set('user', JSON.stringify(user), 1, true);

				return user;
			})
			.catch((error) => {
				if (error.code === 'auth/multi-factor-auth-required') {
					console.error('Multi-factor authentication required:', error);
				} else {
					console.error('Error during login:', error);
				}
				throw error;
			});
	}

	logout(): Promise<void> {
		return this.auth.signOut().then(() => {
			this.userSubject.next(null);
			this.cookieService.delete('user');
			this.cookieService.delete('auth_token');
		});
	}

	getCurrentUser(): Observable<User | null> {
		return this.user$;
	}

	setUser(user: User | null): void {
		this.userSubject.next(user);
	}

	getToken(): Promise<string | null> {
		if (this.auth.currentUser) {
			return this.auth.currentUser.getIdToken().then((token) => token);
		} else {
			return Promise.resolve(null);
		}
	}

	validateToken(storedToken: string): Promise<boolean> {
		return this.getToken().then((currentToken) => {
			return currentToken === storedToken;
		});
	}

	updateUser(user: User | null) {
		this.userSubject.next(user);
	}
}
