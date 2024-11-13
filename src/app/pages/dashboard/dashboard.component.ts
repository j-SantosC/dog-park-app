import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';
import { MyDogsComponent } from '../../components/my-dogs/my-dogs.component';
import { ButtonComponent } from '../../components/button/button.component';
import { Dog } from '../../models/dog-park';
import { DogService } from '../../services/dog.service';
import { DogsUtilsService } from '../../utils/dogs-utils.service';

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
		private dogService: DogService,
		private dogUtils: DogsUtilsService
	) {}

	ngOnInit(): void {
		this.authService.getCurrentUser().subscribe((user) => {
			this.user = user;
			this.dogUtils.getMyDogs().subscribe((dogs) => (this.myDogs = dogs));
		});
	}
}
