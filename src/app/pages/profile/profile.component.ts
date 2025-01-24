import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, firstValueFrom, map, of, Observable, forkJoin } from 'rxjs';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';
import { DogService } from '../../services/dog.service';
import { UploadImageComponent } from '../../components/upload-image/upload-image.component';

interface UserInfo {
	name: string;
	lastname: string;
	email: string;
	birthdate: Date;
}

@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [RouterModule, SpinnerComponent, NgIf, ButtonComponent, ReactiveFormsModule, UploadImageComponent, NgFor],
	templateUrl: './profile.component.html',
	styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
	constructor(
		private profileService: ProfileService,
		private authService: AuthService,
		private router: Router,
		private fb: FormBuilder,
		private userService: UserService,
		private dogService: DogService
	) {}

	loading = true;
	edit = false;
	imageSrc = 'assets/default-dog.webp';

	user: User | null = null;
	userInfo: UserInfo | null = null;
	userDogs: any[] = [];

	userForm!: FormGroup;
	dogForm!: FormGroup;

	newDog = false;
	editDog = '';

	async ngOnInit(): Promise<void> {
		this.userForm = this.fb.group({
			name: ['', Validators.required],
			lastname: ['', Validators.required],
			email: [{ value: '', disabled: true }],
			birthdate: ['', Validators.required],
		});

		this.dogForm = this.fb.group({
			name: ['', Validators.required],
			breed: ['', Validators.required],
			birthdate: ['', Validators.required],
			sex: ['', Validators.required],
			isServiceDog: [false],
		});

		this.user = await firstValueFrom(this.getUser());

		this.userForm.patchValue({ email: this.user?.email });

		this.userInfo = await this.getUserInfo();
		await this.loadImages(true);
		this.getDogs();
		this.loading = false;
	}

	getUser(): Observable<User | null> {
		return this.authService.getCurrentUser();
	}

	async getUserInfo(): Promise<UserInfo | null> {
		this.loading = true;
		try {
			const userInfo = await firstValueFrom(this.userService.getUserInfo(this.user?.uid));
			this.loading = false;
			return userInfo;
		} catch (error) {
			console.error('Error fetching user info:', error);
			this.loading = false;
			return null;
		}
	}

	onEditUserInfo() {
		this.edit = !this.edit;
		this.userForm.patchValue({
			name: this.userInfo?.name,
			lastname: this.userInfo?.lastname,
			email: this.user?.email,
			birthdate: this.userInfo?.birthdate,
		});
	}

	async onSubmit(): Promise<void> {
		if (this.userForm.valid) {
			const userUID = this.user?.uid;
			const formData = this.userForm.getRawValue();
			if (this.edit && !this.userInfo) {
				const userInfo = { uid: userUID, ...formData };
				this.userService.addUserInfo(userInfo).subscribe((data) => console.log(data));
			} else {
				this.userService.updateUserInfo(userUID, formData).subscribe((res) => console.log(res));
			}
		}
		this.edit = false;
		this.userInfo = await this.getUserInfo();
	}

	uploadProfileImage(img: any): void {
		this.profileService.uploadProfileImg(img).subscribe(() => this.loadImages(true));
	}

	async getDogs() {
		this.userDogs = await firstValueFrom(this.dogService.getUserDogs(this.user?.uid));
		this.loadImages(false);
	}

	onEditDog(dogID: string) {
		console.log(dogID);
		this.editDog = dogID;
		const dogToEdit = this.userDogs.find((dog) => {
			return dog.id === dogID;
		});
		if (dogToEdit) {
			this.dogForm.patchValue({
				name: dogToEdit.name,
				breed: dogToEdit.breed,
				birthdate: dogToEdit.birthdate,
				sex: dogToEdit.sex,
				isServiceDog: dogToEdit.isServiceDog,
			});
		} else {
			console.log('no dog to edit');
		}
	}
	onDeleteDog(dogId: string) {
		if (confirm('Are you sure you want to delete this dog?')) {
			this.dogService.deleteDog(dogId).subscribe(
				(response) => {
					console.log('Dog deleted successfully', response);
					this.getDogs();
				},
				(error) => {
					console.error('Error deleting dog:', error);
				}
			);
		}
	}

	onDogSubmit() {
		if (this.dogForm.valid) {
			if (this.newDog) {
				const userUID = this.user?.uid;
				const dogData = { ...this.dogForm.getRawValue(), userUID };
				this.dogService.addDog(dogData).subscribe((res) => this.getDogs());
				this.newDog = false;
			}
			if (this.editDog) {
				const updatedData = this.dogForm.getRawValue();

				this.dogService.updateDogInfo(this.editDog, updatedData).subscribe({
					next: (response) => this.getDogs(),
					error: (error) => console.error('Error updating dog:', error),
				});
			}
			this.editDog = '';
			this.dogForm.reset();
		}
	}
	uploadDogImage(img: any, dog: any) {
		this.dogService.uploadDogImage(dog.id, img).subscribe(() => this.loadImages(false));
	}

	async loadImages(isProfileImage: boolean): Promise<void> {
		const userId = this.user?.uid; // Use existing user ID directly

		if (!userId) {
			console.error('User ID is not available.');
			this.imageSrc = isProfileImage ? 'assets/default-dog.webp' : ''; // Set a default or empty image if no user ID
			return;
		}

		// Separate observables for profile image and dog images to match types
		if (isProfileImage) {
			// Load profile image
			return firstValueFrom(
				this.profileService.getProfileImg(userId).pipe(
					map((imgBlob) => (imgBlob instanceof Blob ? URL.createObjectURL(imgBlob) : 'assets/default-dog.webp')),
					catchError(() => of('assets/default-dog.webp'))
				)
			).then((profileImgSrc) => {
				this.imageSrc = profileImgSrc as string;
				this.loading = false;
			});
		} else {
			// Load dog images
			return firstValueFrom(
				forkJoin(
					this.userDogs.map((dog) =>
						this.dogService.getDogImg(dog.id).pipe(
							map((imgBlob) => ({
								dogId: dog.id,
								imgSrc: imgBlob instanceof Blob ? URL.createObjectURL(imgBlob) : 'assets/default-dog.webp',
							})),
							catchError(() => of({ dogId: dog.id, imgSrc: 'assets/default-dog.webp' }))
						)
					)
				).pipe(catchError(() => of([])))
			).then((dogImages) => {
				// Assign each dog image to the correct dog in userDogs array
				(dogImages as { dogId: string; imgSrc: string }[]).forEach(({ dogId, imgSrc }) => {
					const dog = this.userDogs.find((d) => d.id === dogId);
					if (dog) {
						dog.imageSrc = imgSrc;
					}
				});
				this.loading = false;
			});
		}
	}
	navigateToDogDetail(dogId: string): void {
		this.router.navigate(['/dog-detail', this.user!.uid, dogId]);
	}

	onCancel() {
		this.editDog = '';
		this.newDog = false;
	}

	backClicked(): void {
		this.router.navigate(['/dashboard']);
	}
}
