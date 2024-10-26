import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { from, Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
	const authService = inject(AuthService);

	//TODO Test Interceptor
	return authService.getCurrentUser().pipe(
		take(1),
		switchMap((user) => {
			if (user) {
				return from(user.getIdToken()).pipe(
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
		})
	);
};
