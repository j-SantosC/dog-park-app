import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, Observable, switchMap } from 'rxjs';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [RouterModule, SpinnerComponent, NgIf, ButtonComponent],
	templateUrl: './profile.component.html',
	styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
	constructor(
		private profileService: ProfileService,
		private authService: AuthService,
		private router: Router
	) {}

	imageSrc = 'assets/default-dog.webp';
	loading = true;

	ngOnInit(): void {
		this.getProfileImage();
	}

	onFileSelected(event: Event): void {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			this.UploadProfileImage(file);
		}
	}

	getUser(): Observable<any> {
		return this.authService.getCurrentUser();
	}

	UploadProfileImage(file: File): void {
		const formData = new FormData();
		formData.append('image', file);
		this.profileService.uploadProfileImg(formData).subscribe(() => this.getProfileImage());
	}

	getProfileImage(): void {
		this.loading = true;
		this.getUser()
			.pipe(
				map((user) => user?.uid),
				switchMap((userId) => this.profileService.getProfileImg(userId))
			)
			.subscribe({
				next: (profileImgBlob) => {
					if (profileImgBlob) {
						const objectURL = URL.createObjectURL(profileImgBlob);
						this.imageSrc = objectURL;
					} else {
						this.imageSrc = 'assets/default-dog.webp';
					}
					this.loading = false;
				},
				error: (error) => {
					console.error('Error fetching profile image:', error);
					this.imageSrc = 'assets/default-dog.webp';
					this.loading = false;
				},
			});
	}

	backClicked() {
		this.router.navigate(['/dashboard']);
	}
}
