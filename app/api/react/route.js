// app/api/react/route.js
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

const REACTION_KEYS = {
  '🕯️': 'candle', '🌹': 'rose', '💙': 'blue_heart',
  '🤍': 'white_heart', '🕊️': 'dove',
};

function hashIp(ip) {
  return createHash('sha256').update(ip + 'diarydump_salt').digest('hex').slice(0, 32);
}
function getIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : '0.0.0.0').trim();
}

export async function POST(req) {
  try {
    const { noteId, emoji } = await req.json();
    if (!noteId || !emoji) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const reactionKey = REACTION_KEYS[emoji];
    if (!reactionKey) return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });

    const db = getDb();
    const ipHash = hashIp(getIp(req));
    const reactorRef = db.collection('notes').doc(noteId).collection('reactors').doc(`${ipHash}_${reactionKey}`);
    const existing = await reactorRef.get();
    if (existing.exists) return NextResponse.json({ alreadyReacted: true });

    const batch = db.batch();
    batch.set(reactorRef, { reactedAt: admin.firestore.FieldValue.serverTimestamp() });
    batch.update(db.collection('notes').doc(noteId), {
      [`reactions.${reactionKey}`]: admin.firestore.FieldValue.increment(1)
    });
    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[react]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
