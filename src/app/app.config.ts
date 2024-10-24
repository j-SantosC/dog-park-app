import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { firebaseConfig } from '../../firebase'; // Ajusta la ruta si es necesario

export const appConfig = {
  providers: [{ provide: FIREBASE_OPTIONS, useValue: firebaseConfig }],
};
