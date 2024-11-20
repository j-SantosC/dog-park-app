import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Post } from '../../models/post';
import { ButtonComponent } from '../button/button.component';
import { DatePipe, NgIf } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { CookieService } from '../../services/cookie.service';

@Component({
	selector: 'app-post',
	standalone: true,
	imports: [ButtonComponent, NgIf, DatePipe],
	templateUrl: './post.component.html',
	styleUrl: './post.component.scss',
})
export class PostComponent implements OnInit {
	@Input() post!: Post;
	@Input() mine!: boolean;

	@Output() edit = new EventEmitter();
	@Output() delete = new EventEmitter();

	profileImg: any = '';

	constructor(
		private profileService: ProfileService,
		private cookieService: CookieService
	) {}

	ngOnInit() {
		const user = JSON.parse(this.cookieService.get('user')!);
		this.profileService.getProfileImg(user.uid).subscribe((img: any) => (this.profileImg = URL.createObjectURL(img)));
	}

	editPost() {
		this.edit.emit();
	}

	deletePost() {
		this.delete.emit();
	}
}
