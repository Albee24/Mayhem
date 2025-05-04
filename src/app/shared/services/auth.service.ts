import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from '../models/user';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: User | undefined;
  constructor(
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public ngZone: NgZone,
    public router: Router
  ) {}

SignIn(email: string, password: string) {
        return this.afAuth
          .signInWithEmailAndPassword(email, password)
          .then((result) => {
            if (result.user) {
                const userRef = this.afs.doc<User>(`users/${result.user.uid}`);
                userRef.get().subscribe((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        console.log('userdata', userData);
                        if (userData) {
                            this.userData = {
                                uid: result.user?.uid ?? '',
                                email: result.user?.email ?? '',
                                emailVerified: true,
                                displayName: userData.displayName
                            };
                            this.SetUserData(this.userData);
                            this.router.navigate(['dashboard']);
                        }
                    } else {
                        console.error('User document does not exist in Firestore.');
                    }
                });
            }
          })
          .catch((error) => {
            window.alert(error.message);
          });
      }

  SignUp(email: string, displayName: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
//         this.SendVerificationMail();
        if (result.user) {
            console.log('got a result user', result.user);
            const user: User = {
                uid: result.user.uid,
                email: result.user.email,
                emailVerified: true,
                displayName: displayName
            };
            user.displayName = displayName;
            this.SetUserData(user);
            this.router.navigate(['dashboard']);
        }
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }

  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  get isLoggedIn(): boolean {
    return this.userData !== undefined;
  }

  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.router.navigate(['dashboard']);
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  SetUserData(user: any) {
    console.log('setting user data', user);
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: true,
    };
    this.userData = userData;
    return userRef.set(userData, {
      merge: true,
    });
  }

  SignOut() {
    return this.afAuth.signOut().then(() => {
      this.userData = undefined;
      this.router.navigate(['sign-in']);
    });
  }
}