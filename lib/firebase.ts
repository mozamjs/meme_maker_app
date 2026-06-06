import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCPDPm7v6z5R5AX6cJArSx35GIlPn2E5tE",
  authDomain: "mememakerapp-ab054.firebaseapp.com",
  projectId: "mememakerapp-ab054",
  storageBucket: "mememakerapp-ab054.firebasestorage.app",
  messagingSenderId: "639813316052",
  appId: "1:639813316052:web:68a941b8a3249ff3cc3a41",
};

let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const { initializeApp, getApps, getApp } = require('firebase/app') as typeof import('firebase/app');
    const { getAuth } = require('firebase/auth') as typeof import('firebase/auth');
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    _auth = getAuth(app);
  }
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) {
    const { initializeApp, getApps, getApp } = require('firebase/app') as typeof import('firebase/app');
    const { getFirestore } = require('firebase/firestore') as typeof import('firebase/firestore');
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    _db = getFirestore(app);
  }
  return _db;
}
