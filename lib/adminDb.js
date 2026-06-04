// lib/adminDb.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

export function getAdminDb() {
  if (!admin.apps.length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
  return admin.firestore();
}

export function getFieldValue() {
  return admin.firestore.FieldValue;
}
