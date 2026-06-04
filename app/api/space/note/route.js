// app/api/space/note/route.js
import { NextResponse } from 'next/server';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  return admin.firestore();
}

export async function POST(req) {
  try {
    const { spaceOwner, name, message, forWho, colorKey, x, y, rotation } = await req.json();
    if (!spaceOwner || !name?.trim() || !message?.trim())
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    if (message.length > 500 || name.length > 50)
      return NextResponse.json({ error: 'Content too long' }, { status: 400 });

    const db = getDb();
    const spaceSnap = await db.collection('spaces').doc(spaceOwner).get();
    if (!spaceSnap.exists) return NextResponse.json({ error: 'Space not found' }, { status: 404 });

    const { getSession } = await import('../../../../lib/auth.js');
    const session = await getSession();
    const postedBy = session === spaceOwner ? spaceOwner : 'visitor';

    await db.collection('spaces').doc(spaceOwner).collection('notes').add({
      name: name.trim(), message: message.trim(),
      for: forWho?.trim() || '',
      colorKey: colorKey || 'cream',
      x: x ?? 2000, y: y ?? 2000,
      rotation: rotation ?? (Math.random() - 0.5) * 5,
      postedBy, reactions: {}, views: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[space/note]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

