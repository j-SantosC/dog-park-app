import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DogDetailComponent } from './pages/dog-detail/dog-detail.component';
import { DogParksComponent } from './pages/dog-parks/dog-parks.component';
import { NewPostComponent } from './pages/new-post/new-post.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'sign-up', component: SignUpComponent },
	{ path: 'parks', component: DogParksComponent },
	{ path: 'profile', component: ProfileComponent },
	{ path: 'dog-detail/:userUID/:dogID', component: DogDetailComponent },
	{ path: 'new-post', component: NewPostComponent },
	{ path: 'new-post/:id', component: NewPostComponent },
	{
		path: 'dashboard',
		component: DashboardComponent,
		// canActivate: [AuthGuard],
	},
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
];
