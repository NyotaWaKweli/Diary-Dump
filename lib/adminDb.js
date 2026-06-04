// lib/adminDb.js
import firebaseAdmin from 'firebase-admin';

export function getAdminDb() {
  if (!firebaseAdmin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(sa),
    });
  }
  return firebaseAdmin.firestore();
}

