// app/api/view/route.js
import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { createHash } from 'crypto';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  return admin.firestore();
}

function hashIp(ip) {
  return createHash('sha256').update(ip + 'diarydump_salt').digest('hex').slice(0, 32);
}
function getIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : '0.0.0.0').trim();
}

export async function POST(req) {
  try {
    const { noteId } = await req.json();
    if (!noteId) return NextResponse.json({ error: 'Missing noteId' }, { status: 400 });

    const db = getDb();
    const ipHash = hashIp(getIp(req));
    const viewerRef = db.collection('notes').doc(noteId).collection('viewers').doc(ipHash);
    const existing = await viewerRef.get();
    if (existing.exists) {
      const snap = await db.collection('notes').doc(noteId).get();
      return NextResponse.json({ alreadyViewed: true, views: snap.data()?.views ?? 0 });
    }

    const noteRef = db.collection('notes').doc(noteId);
    const batch = db.batch();
    batch.set(viewerRef, { viewedAt: admin.firestore.FieldValue.serverTimestamp() });
    batch.update(noteRef, { views: admin.firestore.FieldValue.increment(1) });
    await batch.commit();

    const updated = await noteRef.get();
    return NextResponse.json({ success: true, views: updated.data()?.views ?? 1 });
  } catch (err) {
    console.error('[view]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
