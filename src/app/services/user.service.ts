import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../../../config';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private apiUrl = config.apiUrl;

	constructor(private http: HttpClient) {}

	// Method to add a user
	addUserInfo(data: any) {
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		return this.http.post(`${this.apiUrl}/addUser`, data, { headers });
	}

	// Method to get a user by UID
	getUserInfo(uid?: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/getUser/${uid}`);
	}

	updateUserInfo(uid?: string, userData?: { name: string; lastname: string; email: string; birthdate: string }): Observable<any> {
		return this.http.put(`${this.apiUrl}/updateUser/${uid}`, userData, {
			headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
		});
	}
}
