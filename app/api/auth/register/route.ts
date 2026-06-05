import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/dal';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { displayName, email, password } = await request.json();
    if (!displayName?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be 6+ characters' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    const userId = uuidv4();
    const user = await createUser({
      id: userId,
      email: email.toLowerCase().trim(),
      display_name: displayName.trim(),
    });
    if (!user) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
    const token = await createToken({ userId: user.id, email: user.email });
    setAuthCookie(token);
    return NextResponse.json({ user: { id: user.id, email: user.email, display_name: user.display_name } });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
