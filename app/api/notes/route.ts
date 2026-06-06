import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createNote, getSpaceById, isSpaceMember, joinSpace } from '@/lib/dal';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const body = await request.json();
    const { space_id, title, content, color, color_hex, tags, position_x, position_y, rotation, image_url, allow_saves } = body;

    if (!space_id || !content?.trim()) {
      return NextResponse.json({ error: 'Space and content required' }, { status: 400 });
    }

    const space = await getSpaceById(space_id);
    if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });

    const isMember = await isSpaceMember(space_id, user.userId);
    const isOwner = space.owner_id === user.userId;
    
    if (!isMember && !isOwner && space.is_public) {
      // Auto-join public spaces on first write
      await joinSpace(space_id, user.userId);
    } else if (!isMember && !isOwner) {
      return NextResponse.json({ error: 'Join this space to write' }, { status: 403 });
    }

    const note = await createNote({
      space_id,
      author_id: user.userId,
      title: title || '',
      content: content.trim(),
      color,
      color_hex,
      tags,
      position_x: position_x ?? Math.random() * 80 + 10,
      position_y: position_y ?? Math.random() * 70 + 15,
      rotation: rotation ?? Math.floor(Math.random() * 20) - 10,
      image_url,
      allow_saves,
    });

    if (!note) return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    return NextResponse.json(note, { status: 201 });
    
  } catch (err) {
    console.error('Create note error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
