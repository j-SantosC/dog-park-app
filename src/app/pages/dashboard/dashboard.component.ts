import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { MyDogsComponent } from '../../components/my-dogs/my-dogs.component';
import { ButtonComponent } from '../../components/button/button.component';
import { Dog } from '../../models/dog-park';
import { DogService } from '../../services/dog.service';
import { DogsUtilsService } from '../../utils/dogs-utils.service';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { Post } from '../../models/post';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterModule, MyDogsComponent, ButtonComponent, PostComponent, SpinnerComponent],
})
export class DashboardComponent implements OnInit {
	public user: User | null = null;
	public myDogs: Dog[] = [];
	public posts: any = [];
	public loading = true;

	constructor(
		private authService: AuthService,
		private dogService: DogService,
		private dogUtils: DogsUtilsService,
		private postService: PostService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.authService.getCurrentUser().subscribe((user) => {
			this.user = user;
			this.dogUtils.getMyDogs().subscribe((dogs) => (this.myDogs = dogs));
		});
		this.fetchPosts();
	}
	fetchPosts() {
		this.postService.getAllPosts().subscribe({
			next: (data) => {
				this.loading = false;
				this.posts = data;
				console.log('Posts fetched successfully:', this.posts);
			},
			error: (err) => console.error('Error fetching posts:', err),
		});
	}

	deletePost(post: Post): void {
		if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
			if (this.user && this.user.uid) {
				this.postService.deletePost(post.id, this.user.uid, post.imageUrl).subscribe({
					next: () => {
						this.posts = this.posts.filter((p: any) => p.id !== post.id);
					},
					error: (err) => {
						console.error('Error deleting post:', err);
					},
				});
			}
		}
	}

	isMine(postID: string) {
		return this.user!.uid === postID;
	}

	onEdit(post: any) {
		this.router.navigate(['new-post', post.id]);
	}
}
