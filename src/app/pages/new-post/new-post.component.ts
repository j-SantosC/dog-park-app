import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadImageComponent } from '../../components/upload-image/upload-image.component';
import { ButtonComponent } from '../../components/button/button.component';
import { CookieService } from '../../services/cookie.service';
import { User } from '@angular/fire/auth';
import { PostService } from '../../services/post.service';
import { PostComponent } from '../../components/post/post.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-new-post',
	standalone: true,
	imports: [UploadImageComponent, ReactiveFormsModule, ButtonComponent, PostComponent],
	templateUrl: './new-post.component.html',
	styleUrls: ['./new-post.component.scss'],
})
export class NewPostComponent implements OnInit {
	postForm!: FormGroup;
	user!: User;
	fileUploaded: File | null = null;
	imagePreview: any = 'assets/default-dog.webp';
	postToEdit: any = null;

	constructor(
		private fb: FormBuilder,
		private cookieService: CookieService,
		private postService: PostService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit() {
		const postId = this.route.snapshot.paramMap.get('id');
		if (postId) {
			this.postService.getPostById(postId).subscribe((post) => {
				this.postToEdit = { ...post, id: postId };
				this.imagePreview = this.postToEdit.imageUrl;
				this.postForm.patchValue({
					title: this.postToEdit?.title,
					content: this.postToEdit?.content,
				});
				console.log(post);
			});
		} else {
			// Initialize form for creating a new post
			console.log('Creating a new post');
		}

		// Retrieve user information from the cookie
		this.user = JSON.parse(this.cookieService.get('user')!);

		// Initialize the form with title and content fields
		this.postForm = this.fb.group({
			title: ['', Validators.required],
			content: ['', Validators.required],
		});
	}

	// Called when the file is uploaded via UploadImageComponent
	imgUploaded(file: File) {
		this.fileUploaded = file;
		if (this.imagePreview) {
			URL.revokeObjectURL(this.imagePreview); // Free previous object URL if it exists
		}
		this.imagePreview = URL.createObjectURL(file); // Create new object URL for preview
	}

	// Submit form data with image to backend
	submit() {
		if (this.postForm.invalid) {
			console.log('invalid form');

			return; // Exit if the form is invalid or no file is uploaded
		}

		const formData = new FormData();
		formData.append('title', this.postForm.get('title')?.value);
		formData.append('content', this.postForm.get('content')?.value);
		formData.append('userID', this.user.uid);
		if (this.fileUploaded) {
			formData.append('file', this.fileUploaded); // Add the image file
		}

		if (!this.postToEdit) {
			// Create a new post
			this.postService.createPost(formData).subscribe({
				next: () => {
					console.log('Post created successfully');
					this.resetAndNavigate();
				},
				error: (err) => {
					console.error('Error creating post:', err);
				},
			});
		} else {
			// Edit an existing post
			this.postService.editPost(this.postToEdit.id, formData).subscribe({
				next: (response) => {
					console.log('Post updated successfully:', response);
					this.resetAndNavigate();
				},
				error: (error) => console.error('Error updating post:', error),
			});
		}
	}
	resetAndNavigate() {
		this.postForm.reset();
		this.fileUploaded = null;
		this.imagePreview = 'assets/default-dog.webp';
		this.router.navigate(['/dashboard']);
	}
}
