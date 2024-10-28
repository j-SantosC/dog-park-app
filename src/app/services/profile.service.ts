import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../../../config'; // Adjust the path if needed
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ProfileService {
	constructor(private http: HttpClient) {}

	uploadProfileImg(formData: FormData) {
		const url = `${config.apiUrl}/upload-profile-image`;
		return this.http.post(url, formData).pipe(
			catchError((error) => {
				console.error('Upload error:', error); // Log the error to console
				return throwError(() => new Error('Failed to upload profile image.')); // Emit a simple error message
			})
		);
	}

	getProfileImg(userId: string): Observable<Blob | MediaSource> {
		return this.http.get(`${config.apiUrl}/profile-images/${userId}`, { responseType: 'blob' });
	}
}
