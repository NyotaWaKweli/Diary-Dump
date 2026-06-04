// app/api/auth/delete/route.js
import { NextResponse } from 'next/server';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  return admin.firestore();
}

export async function POST(req) {
  try {
    const { getSession, clearCookieOptions } = await import('../../../../lib/auth.js');
    const username = await getSession();
    if (!username) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

    const db = getDb();
    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const match = await bcrypt.compare(password, userDoc.data().password);
    if (!match) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });

    const notesSnap = await db.collection('spaces').doc(username).collection('notes').get();
    const batch = db.batch();
    notesSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(db.collection('spaces').doc(username));
    batch.delete(userRef);
    await batch.commit();

    const res = NextResponse.json({ success: true });
    res.cookies.set(clearCookieOptions());
    return res;
  } catch (err) {
    console.error('[delete]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
