import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { AppComponent } from './app/app.component';
import { firebaseConfig } from '../firebase'; // Ya tienes tu archivo firebase.ts
import { appConfig } from './app/app.config'; // Importa el appConfig
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './app/interceptors/token-interceptor.service';

import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideRouter(routes),
  ],
});
