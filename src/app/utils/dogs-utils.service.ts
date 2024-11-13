import { Injectable } from '@angular/core';
import { of, switchMap, map, toArray, from, mergeMap, Observable } from 'rxjs';
import { Dog } from '../models/dog-park';
import { CookieService } from '../services/cookie.service';
import { DogService } from '../services/dog.service';

@Injectable({
	providedIn: 'root',
})
export class DogsUtilsService {
	constructor(
		private cookieService: CookieService,
		private dogService: DogService
	) {}

	public getMyDogs(): Observable<any> {
		// Adjust the return type as needed
		const userCookie = this.cookieService.get('user');
		let userUID = '';

		if (userCookie) {
			userUID = JSON.parse(userCookie).uid;
		}

		return of(userUID).pipe(
			switchMap((userID: string) => this.dogService.getUserDogs(userID)),
			map((dogData: Dog[]) => dogData.map((dog) => dog.id)),
			switchMap((dogIDs: string[]) => this.getDogImages(dogIDs)) // Call the new function to fetch images
		);
	}

	public getDogImages(dogIDs: string[]): Observable<{ id: string; imageSrc: string }[]> {
		return from(dogIDs).pipe(
			mergeMap((dogID: string) =>
				this.dogService.getDogImg(dogID).pipe(
					map((dogBlob: any) => ({
						id: dogID,
						imageSrc: URL.createObjectURL(dogBlob),
					}))
				)
			),
			toArray()
		);
	}
}
