import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase bootstrap — Auth + Cloud Firestore only.
 *
 * Cloud Storage is deliberately NOT initialised. This portal never uploads a
 * byte (receipts are generated client-side with jsPDF, activity photos are
 * plain URLs), and Cloud Storage for Firebase requires the paid Blaze plan —
 * calling getStorage() on a Spark project throws at startup. Keeping the
 * import out entirely means the dependency can never be reached by accident.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'DEMO_API_KEY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-tadika.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-tadika',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:demo',
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'DEMO_API_KEY'
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
