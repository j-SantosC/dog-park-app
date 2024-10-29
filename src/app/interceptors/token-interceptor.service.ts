import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
	const authService = inject(AuthService);

	const currentUser = authService.auth.currentUser;

	if (currentUser) {
		return from(currentUser.getIdToken()).pipe(
			switchMap((token) => {
				const clonedReq = req.clone({
					setHeaders: {
						Authorization: `Bearer ${token}`,
					},
				});
				return next(clonedReq);
			})
		);
	} else {
		return next(req);
	}
};
