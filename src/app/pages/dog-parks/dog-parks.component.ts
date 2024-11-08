import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { ButtonComponent } from '../../components/button/button.component';
import { ParkService } from '../../services/park.service';
import { firstValueFrom, forkJoin, from, map, mergeMap, of, switchMap } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { DogService } from '../../services/dog.service';
import { CookieService } from '../../services/cookie.service';

@Component({
	selector: 'app-dog-parks',
	standalone: true,
	imports: [FormsModule, ButtonComponent, NgIf, NgFor],
	templateUrl: './dog-parks.component.html',
	styleUrl: './dog-parks.component.scss',
})
export class DogParksComponent implements OnInit {
	private map!: L.Map;
	public searchQuery: string = '';
	dogParks: any[] = [];
	public selectedPark: any = null;
	dogs: any = [];
	myDogs: any = [];

	inThePark = false;

	constructor(
		private parkService: ParkService,
		private dogService: DogService,
		private cookieService: CookieService
	) {}

	async ngOnInit() {
		this.dogParks = await firstValueFrom(this.parkService.getDogParks());
		await this.initMap();
		this.addMarkers();
		this.getMyDogs();
		this.parkService.subscribeToDogRemovals('-OB7rEpIqhifvFYbeDzU');

		// Suscribirse a las notificaciones de eliminación de perros
		this.parkService.dogRemoved$.subscribe(({ dogId, parkId }) => {
			console.log(`Dog with ID ${dogId} removed from park ${parkId}`);
			this.removeDogFromView(dogId); // Llama a una función para actualizar la vista
		});
	}

	private initMap(): void {
		this.map = L.map('map').setView([33.62288411067229, -117.91709981084206], 12);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
		}).addTo(this.map);

		this.dogParks.forEach((park) => {
			L.marker([park.latitude, park.longitude]).addTo(this.map).bindPopup(park.name);
		});
	}
	removeDogFromView(dogId: string) {
		this.dogParks = this.dogParks.map((park) => {
			if (park.id === '-OB7rEpIqhifvFYbeDzU') {
				if (park.dogs && typeof park.dogs === 'object') {
					const { [dogId]: _, ...remainingDogs } = park.dogs;
					park.dogs = remainingDogs;
				}
			}
			return park;
		});

		this.dogs = Object.values(this.dogParks.find((park) => park.id === '-OB7rEpIqhifvFYbeDzU')?.dogs || {});

		console.log('executed!!!');
	}

	getMyDogs() {
		const userCookie = this.cookieService.get('user');
		let userUID = '';
		if (userCookie) {
			userUID = JSON.parse(userCookie).uid;
			console.log(userUID);
		}
		of(userUID)
			.pipe(
				switchMap((userID: any) => this.dogService.getUserDogs(userID)), // Get user's dogs based on user ID
				switchMap((dogIDs: string[]) =>
					from(dogIDs).pipe(
						mergeMap((dog: any) =>
							this.dogService.getDogImg(dog.id).pipe(
								map((dogBlob: any) =>
									this.myDogs.push({
										dog: dog.id,
										url: URL.createObjectURL(dogBlob), // Convert Blob to URL for image display
									})
								)
							)
						)
					)
				)
			)
			.subscribe((dogData) => {
				if (dogData && dogData.url) {
					this.myDogs.push(dogData.url); // Add each dog's image URL to the list
				}
			});
	}

	// Method to search for a location
	public searchLocation(): void {
		if (this.searchQuery) {
			(L.Control as any).Geocoder.nominatim().geocode(this.searchQuery, (results: any) => {
				if (results && results.length > 0) {
					const result = results[0];
					const latlng = result.center;
					this.map.setView(latlng, 13); // Set map to the found location
					L.marker(latlng).addTo(this.map).bindPopup(result.name).openPopup();
				} else {
					alert('Location not found. Please try a different search term.');
				}
			});
		}
	}

	getParkDogs() {
		const dogsArray = this.selectedPark.dogs ? Object.values(this.selectedPark.dogs) : [];

		// Crear un array de observables para las imágenes de los perros
		const dogImageObservables: any[] = dogsArray.map((dog: any) => this.dogService.getDogImg(dog.dog));

		// Usar forkJoin para esperar todas las solicitudes de imagen
		forkJoin<Blob[]>(dogImageObservables).subscribe(
			(dogImages) => {
				this.dogs = dogImages
					.filter((dogImg) => !!dogImg) // Filtrar imágenes nulas o vacías
					.map((dogImg) => URL.createObjectURL(dogImg)); // Convertir cada Blob a URL
			},
			(error) => {
				console.error('Error loading dog images:', error);
			}
		);
	}

	private addMarkers(): void {
		this.dogParks.forEach((park) => {
			const marker = L.marker([park.latitude, park.longitude]).addTo(this.map);

			marker.on('click', () => {
				this.selectedPark = park;
				this.dogs = []; // Limpiar URLs previas

				// Convertir `dogs` a un array si es un objeto
				this.getParkDogs();
			});
		});
	}

	addDogsToPark() {
		this.inThePark = true;

		of(...this.myDogs)
			.pipe(
				mergeMap((dog: any) => {
					this.dogs.push(dog.url);
					return this.parkService.addDogToPark(this.selectedPark.id, dog.dog);
				})
			)
			.subscribe(
				(response) => {
					this.getParkDogs();
				},
				(error) => {
					console.error('Error adding dog:', error);
				}
			);
	}
}
