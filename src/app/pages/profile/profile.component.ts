import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, distinctUntilChanged, firstValueFrom, map, Observable, of, take } from 'rxjs';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../components/button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';

interface UserInfo {
	name: string;
	lastname: string;
	email: string;
	birthdate: Date;
}
@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [RouterModule, SpinnerComponent, NgIf, ButtonComponent, ReactiveFormsModule],
	templateUrl: './profile.component.html',
	styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
	constructor(
		private profileService: ProfileService,
		private authService: AuthService,
		private router: Router,
		private fb: FormBuilder,
		private userService: UserService
	) {}

	loading = true;
	edit = false;

	imageSrc = 'assets/default-dog.webp';

	user: User | null = null;
	userInfo: UserInfo | null = null;
	userForm!: FormGroup;

	async ngOnInit(): Promise<void> {
		this.userForm = this.fb.group({
			name: ['', Validators.required],
			lastname: ['', Validators.required],
			email: [{ value: '', disabled: true }],
			birthdate: ['', Validators.required],
		});

		this.user = await firstValueFrom(this.getUser());
		this.userInfo = await this.getUserInfo();

		this.userForm.patchValue({
			name: this.userInfo?.name,
			lastname: this.userInfo?.lastname,
			email: this.user?.email,
			birthdate: this.userInfo?.birthdate,
		});

		await this.getProfileImage();
		this.loading = false;
	}

	async getUserInfo(): Promise<UserInfo | null> {
		try {
			return await firstValueFrom(this.userService.getUserInfo(this.user?.uid));
		} catch (error) {
			console.error('Error fetching user info:', error);
			return null;
		}
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

	onFileSelected(event: Event): void {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			this.UploadProfileImage(file);
		}
	}

	UploadProfileImage(file: File): void {
		this.loading = true;
		const formData = new FormData();
		formData.append('image', file);
		this.profileService.uploadProfileImg(formData).subscribe(() => this.getProfileImage());
	}

	getProfileImage(): void {
		this.loading = true;
		this.getUserId()
			.pipe(
				take(1),
				catchError((error) => {
					return of(null); // or return an empty observable
				})
			)
			.subscribe((userId) => this.loadProfileImage(userId!));
	}

	getUserId(): Observable<string> {
		return this.getUser().pipe(
			map((user) => {
				return user!.uid;
			}),
			distinctUntilChanged()
		);
	}

	loadProfileImage(userId: string): void {
		this.profileService.getProfileImg(userId).subscribe((profileImgBlob) => {
			if (profileImgBlob) {
				const objectURL = URL.createObjectURL(profileImgBlob);
				this.imageSrc = objectURL;
			} else {
				this.imageSrc = 'assets/default-dog.webp';
			}
			this.loading = false;
		});
	}

	getUser(): Observable<User | null> {
		return this.authService.getCurrentUser();
	}

	backClicked(): void {
		this.router.navigate(['/dashboard']);
	}
}
