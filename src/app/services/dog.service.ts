import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { config } from '../../../config';

export interface Dog {
	name: string;
	breed: string;
	birthdate: string;
	sex: string;
	isServiceDog: boolean;
	dogID: string;
	imageSrc?: string;
}

@Injectable({
	providedIn: 'root',
})
export class DogService {
	private apiUrl = `${config.apiUrl}`; // Replace with your actual API URL

	constructor(private http: HttpClient) {}

	addDog(dog: Dog): Observable<any> {
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		return this.http.post<any>(`${this.apiUrl}/add-dog`, dog, { headers });
	}

	getUserDogs(userUID?: string): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/user-dogs/${userUID}`).pipe(
			catchError((error) => {
				console.log('Error getting user dogs', error);
				return throwError(error);
			})
		);
	}

	uploadDogImage(dogID: string, formData: FormData): Observable<any> {
		const url = `${this.apiUrl}/upload-dog-image/${dogID}`;
		return this.http.post(url, formData).pipe(catchError((error) => throwError(error)));
	}

	getDogImg(dogID: string): Observable<Blob | MediaSource | undefined> {
		if (dogID) {
			return this.http.get(`${config.apiUrl}/dog-images/${dogID}`, { responseType: 'blob' });
		} else {
			return of(undefined);
		}
	}
	updateDogInfo(dogId: string, dogData: Partial<{ name: string; breed: string; birthdate: string; sex: string; isServiceDog: boolean }>) {
		return this.http.put(`${this.apiUrl}/update-dog/${dogId}`, dogData);
	}

	deleteDog(dogId: string): Observable<any> {
		return this.http.delete(`${this.apiUrl}/delete-dog/${dogId}`);
	}
}
