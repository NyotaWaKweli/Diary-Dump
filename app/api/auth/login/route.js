// app/api/auth/login/route.js
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
    const { username: raw, password } = await req.json();
    const username = (raw || '').toLowerCase().trim();
    if (!username || !password)
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });

    const db = getDb();
    const doc = await db.collection('users').doc(username).get();
    if (!doc.exists)
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });

    const match = await bcrypt.compare(password, doc.data().password);
    if (!match)
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });

    const { signToken, cookieOptions } = await import('../../../../lib/auth.js');
    const token = await signToken(username);
    const res = NextResponse.json({ success: true, username });
    res.cookies.set(cookieOptions(token));
    return res;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
