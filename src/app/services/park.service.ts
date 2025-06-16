import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { config } from '../../../config';
import { Database, ref, onChildRemoved, onChildAdded } from '@angular/fire/database';

@Injectable({
	providedIn: 'root',
})
export class ParkService {
	constructor(private http: HttpClient) {}

	apiUrl = config.apiUrl;
	private database: Database = inject(Database);

	dogRemoved$ = new Subject<{ dogId: string; parkId: string }>();
	dogAdded$ = new Subject<{ dogId: string; parkId: string }>();

	getDogParks(): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/dog-parks`);
	}

	addDogToPark(parkId: string, dogId: string): Observable<any> {
		const url = `${this.apiUrl}/dog-parks/${parkId}/dogs`;
		const dogData = { dogId: dogId };
		return this.http.post(url, dogData);
	}
	subscribeToDogChanges(parkId: string) {
		const dogsRef = ref(this.database, `dogParks/${parkId}/dogs`);

		// Listen for dog removals
		onChildRemoved(dogsRef, (snapshot) => {
			const removedDogId = snapshot.key!;
			this.dogRemoved$.next({ dogId: removedDogId, parkId }); // Emit event when a dog is removed
		});

		// Listen for dog additions
		onChildAdded(dogsRef, (snapshot) => {
			const addedDogId = snapshot.key!;
			this.dogAdded$.next({ dogId: addedDogId, parkId }); // Emit event when a dog is added
		});
	}

	removeDogFromPark(parkId: string, dogId: string): Observable<any> {
		return this.http.delete(`${this.apiUrl}/dog-parks/${parkId}/dogs/${dogId}`);
	}

	getParkById(parkId: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/dog-parks/${parkId}`);
	}
}
