import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'sign-up', component: SignUpComponent },
	{ path: 'profile', component: ProfileComponent },
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [AuthGuard],
	},
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
];