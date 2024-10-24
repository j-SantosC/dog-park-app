import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: User | null = null;

  constructor(private auth: Auth) {}

  login(email: string, password: string): Promise<User | null> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        this.user = userCredential.user;

        return this.user;
      })
      .catch((error) => {
        console.error('Error during login:', error);
        throw error;
      });
  }

  logout(): Promise<void> {
    return this.auth.signOut().then(() => {
      this.user = null;
    });
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): Promise<string | null> {
    if (this.auth.currentUser) {
      return this.auth.currentUser.getIdToken().then((token) => token);
    } else {
      return Promise.resolve(null);
    }
  }

  validateToken(storedToken: string): Promise<boolean> {
    return this.getToken().then((currentToken) => {
      return currentToken === storedToken;
    });
  }
}
