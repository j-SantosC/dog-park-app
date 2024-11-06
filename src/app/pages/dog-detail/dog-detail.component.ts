import { Component, OnInit } from '@angular/core';
import { DogService } from '../../services/dog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { map } from 'rxjs';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
	selector: 'app-dog-detail',
	standalone: true,
	imports: [NgIf, ButtonComponent],
	templateUrl: './dog-detail.component.html',
	styleUrls: ['./dog-detail.component.scss'],
})
export class DogDetailComponent implements OnInit {
	dog: any = {};
	dogId = '';
	userUID = '';
	imgSrc = '';

	constructor(
		private dogService: DogService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit(): void {
		this.dogId = this.route.snapshot.paramMap.get('dogID') || '';
		this.userUID = this.route.snapshot.paramMap.get('userUID') || '';

		// Obtener detalles del perro según `dogId` y `userUID`
		this.dogService.getUserDogs(this.userUID).subscribe((dogs) => {
			this.dog = dogs.find((dog: any) => dog.id === this.dogId);

			// Si se encuentra el perro, obtener la imagen
			if (this.dog) {
				this.dogService
					.getDogImg(this.dog.id)
					.pipe(map((imgBlob) => (this.imgSrc = imgBlob instanceof Blob ? URL.createObjectURL(imgBlob) : 'assets/default-dog.webp')))
					.subscribe();
			} else {
				console.error('Dog not found.');
			}
		});
	}
	onBack() {
		this.router.navigate(['/profile']);
	}
}
