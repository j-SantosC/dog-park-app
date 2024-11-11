import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { ButtonComponent } from '../../components/button/button.component';
import { ParkService } from '../../services/park.service';
import { firstValueFrom, from, map, mergeMap, Observable, of, Subscription, switchMap, toArray } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { DogService } from '../../services/dog.service';
import { CookieService } from '../../services/cookie.service';
import { Dog, Park } from '../../models/dog-park';
import { Router } from '@angular/router';
import { MyDogsComponent } from '../../components/my-dogs/my-dogs.component';

@Component({
	selector: 'app-dog-parks',
	standalone: true,
	imports: [FormsModule, ButtonComponent, NgIf, NgFor, ButtonComponent, MyDogsComponent],
	templateUrl: './dog-parks.component.html',
	styleUrl: './dog-parks.component.scss',
})
export class DogParksComponent implements OnInit {
	private map!: L.Map;
	public searchQuery: string = '';

	public dogParks: Park[] = [];

	public selectedPark: Park | null = null;
	public myDogsPark: Park | null = null;

	parkDogs: Dog[] = [];
	myDogs: Dog[] = [];

	subscription: Subscription | undefined;

	inThePark = false;

	constructor(
		private parkService: ParkService,
		private dogService: DogService,
		private cookieService: CookieService,
		private router: Router
	) {}

	async ngOnInit(): Promise<void> {
		this.dogParks = await this.getDogParks();
		this.initMap();
		this.addMarkers();
		this.getMyDogs();

		this.parkService.dogRemoved$.subscribe(({ dogId, parkId }) => {
			console.log(`Dog with ID ${dogId} removed from park ${parkId}`);
			if (this.selectedPark?.id === parkId) {
				this.parkDogs = this.parkDogs.filter((dog: Dog) => {
					return dogId !== dog.id;
				});
			}
		});
		this.parkService.dogAdded$.subscribe(({ dogId, parkId }) => {
			console.log(`Dog with ID ${dogId} added to park ${parkId}`);
			if (this.selectedPark?.id === parkId && this.myDogs.every((dog) => dog.id !== dogId)) {
				this.getDogImages([dogId]).subscribe((dogs: Dog[]) => {
					dogs.forEach((dog) => {
						this.parkDogs = [...this.parkDogs, dog];
					});
				});
			}
		});
	}

	private initMap(): void {
		this.map = L.map('map').setView([33.62288411067229, -117.91709981084206], 12);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
		}).addTo(this.map);

		this.dogParks.forEach((park) => {
			if (park.longitude && park.latitude) {
				L.marker([park.latitude, park.longitude])
					.addTo(this.map)
					.bindPopup(park.name ?? 'Unamed park');
			}
		});
	}

	private addMarkers(): void {
		this.dogParks.forEach((park) => {
			if (park.longitude && park.latitude) {
				const marker = L.marker([park.latitude, park.longitude]).addTo(this.map);

				marker.on('click', () => {
					this.selectedPark = park;
					this.parkDogs = [];
					this.getSelectedParkDogs();
				});
			}
		});
	}

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

	async getDogParks(): Promise<Park[]> {
		return await firstValueFrom(this.parkService.getDogParks());
	}

	public getMyDogs(): void {
		const userCookie = this.cookieService.get('user');
		let userUID = '';
		if (userCookie) {
			userUID = JSON.parse(userCookie).uid;
		}
		of(userUID)
			.pipe(
				switchMap((userID: string) => this.dogService.getUserDogs(userID)),
				map((dogData: Dog[]) => dogData.map((dog) => dog.id)),
				switchMap((dogIDs: string[]) => this.getDogImages(dogIDs)) // Call the new function to fetch images
			)
			.subscribe((dogsWithImgs) => (this.myDogs = dogsWithImgs));
	}

	private getSelectedParkDogs(): void {
		if (this.selectedPark?.id) {
			this.parkService.getParkById(this.selectedPark.id).subscribe((actualPark: Park) => {
				const dogsArray = actualPark.dogs ? Object.values(actualPark.dogs) : [];
				const dogsIDsArray = dogsArray ? dogsArray.map((dog: Dog) => dog.id) : [];
				this.getDogImages(dogsIDsArray).subscribe((dogsWithImgs) => (this.parkDogs = dogsWithImgs));
			});
		}
	}

	public addMyDogsToPark(): void {
		if (this.selectedPark && this.selectedPark.id) {
			this.inThePark = true;
			this.myDogsPark = this.selectedPark;
			this.subscription = of(...this.myDogs)
				.pipe(
					mergeMap((dog: Dog) => {
						this.parkDogs.push(dog);
						return this.parkService.addDogToPark(this.selectedPark!.id!, dog.id);
					})
				)
				.subscribe(
					(response) => {
						console.log(response);
					},
					(error) => {
						console.error('Error adding dog:', error);
					}
				);
			if (this.myDogsPark?.id) {
				this.parkService.subscribeToDogChanges(this.myDogsPark?.id);
			}
		}
	}

	private getDogImages(dogIDs: string[]): Observable<{ id: string; imageSrc: string }[]> {
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

	ngOnDestroy(): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	back() {
		this.router.navigate(['/dashboard']);
	}
}
