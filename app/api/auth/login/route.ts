import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { getUserByEmail } from '@/lib/dal';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash || '');
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createToken({ userId: user.id, email: user.email });
    setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, display_name: user.display_name }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
