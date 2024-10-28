import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, Observable, switchMap } from 'rxjs';

@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [RouterModule],
	templateUrl: './profile.component.html',
	styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
	constructor(
		private profileService: ProfileService,
		private authService: AuthService
	) {}

	imageSrc = 'assets/default-dog.webp';

	ngOnInit(): void {
		this.getUser()
			.pipe(
				map((user) => user.uid),
				switchMap((userId) => {
					return this.profileService.getProfileImg(userId);
				})
			)
			.subscribe({
				next: (profileImgBlob) => {
					const objectURL = URL.createObjectURL(profileImgBlob); // Convert Blob to URL
					this.imageSrc = objectURL;
				},
				error: (error) => console.error('Error fetching profile image:', error),
			});
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
		this.profileService.uploadProfileImg(formData).subscribe((data) => console.log(data));
	}
}
