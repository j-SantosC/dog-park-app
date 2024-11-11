import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';
import { MyDogsComponent } from '../../components/my-dogs/my-dogs.component';
import { ButtonComponent } from '../../components/button/button.component';
import { of, switchMap, map, from, mergeMap, Observable, toArray } from 'rxjs';
import { Dog } from '../../models/dog-park';
import { DogService } from '../../services/dog.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterModule, MyDogsComponent, ButtonComponent],
})
export class DashboardComponent implements OnInit {
	public user: User | null = null;
	public myDogs: Dog[] = [];

	constructor(
		private authService: AuthService,
		private dogService: DogService
	) {}

	ngOnInit(): void {
		this.authService.getCurrentUser().subscribe((user) => {
			this.user = user;
			this.getMyDogs();
		});
	}

	public getMyDogs(): void {
		let userUID = '';
		if (this.user) {
			userUID = this.user.uid;
		}
		of(userUID)
			.pipe(
				switchMap((userID: string) => this.dogService.getUserDogs(userID)),
				map((dogData: Dog[]) => dogData.map((dog) => dog.id)),
				switchMap((dogIDs: string[]) => this.getDogImages(dogIDs)) // Call the new function to fetch images
			)
			.subscribe((dogsWithImgs) => (this.myDogs = dogsWithImgs));
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
}
