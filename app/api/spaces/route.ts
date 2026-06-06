import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createSpace, getSpaceBySlug } from '@/lib/dal';
import { generateSlug } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const { name, description, password, isPublic } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Space name required' }, { status: 400 });

    const slug = generateSlug(name);
    const existing = await getSpaceBySlug(slug);
    if (existing) return NextResponse.json({ error: 'Name taken' }, { status: 409 });

    let passwordHash = null;
    if (password) {
      const { hashPassword } = await import('@/lib/auth');
      passwordHash = await hashPassword(password);
    }

    const space = await createSpace({
      name: name.trim(),
      slug,
      owner_id: user.userId,
      description: description || '',
      is_public: isPublic ?? true,
      password_hash: passwordHash,
    });

    if (!space) return NextResponse.json({ error: 'Failed to create space' }, { status: 500 });
    return NextResponse.json(space, { status: 201 });
    
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
