import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterModule],
})
export class DashboardComponent implements OnInit {
	public user: User | null = null;

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.authService.getCurrentUser().subscribe((user) => {
			this.user = user;
		});
	}
}
