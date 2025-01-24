import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Post } from '../../models/post';
import { ButtonComponent } from '../button/button.component';
import { DatePipe, NgIf } from '@angular/common';
import { CookieService } from '../../services/cookie.service';
import { UserService } from '../../services/user.service';

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
	@Input() owner!: any;

	@Output() edit = new EventEmitter();
	@Output() delete = new EventEmitter();

	userName: string = '';

	constructor(
		private userService: UserService,
		private cookieService: CookieService
	) {}

	ngOnInit() {
		this.userService.getUserInfo(this.owner).subscribe((data: any) => (this.userName = data.name));
	}

	editPost() {
		this.edit.emit();
	}

	deletePost() {
		this.delete.emit();
	}
}
