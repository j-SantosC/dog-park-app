import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { config } from '../../../config';
import { Database, ref, onChildRemoved } from '@angular/fire/database';

@Injectable({
	providedIn: 'root',
})
export class ParkService {
	constructor(private http: HttpClient) {}

	apiUrl = config.apiUrl;
	private database: Database = inject(Database);
	public dogRemoved$ = new Subject<{ dogId: string; parkId: string }>(); // Subject para emitir eventos de eliminación de perros

	getDogParks(): Observable<any> {
		return this.http.get<any>(`${this.apiUrl}/dog-parks`);
	}

	addDogToPark(parkId: string, dogId: string): Observable<any> {
		const url = `${this.apiUrl}/dog-parks/${parkId}/dogs`;
		const dogData = { dogId: dogId };
		return this.http.post(url, dogData);
	}
	subscribeToDogRemovals(parkId: string) {
		const dogsRef = ref(this.database, `dogParks/${parkId}/dogs`);
		onChildRemoved(dogsRef, (snapshot) => {
			const removedDogId = snapshot.key!;
			this.dogRemoved$.next({ dogId: removedDogId, parkId }); // Emite el evento cuando se elimina un perro
		});
	}
}
