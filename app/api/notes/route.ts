import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createNote, getSpaceById } from '@/lib/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const formData = await request.formData();
    const spaceId = formData.get('spaceId') as string;
    const content = formData.get('content') as string;
    const color = formData.get('color') as string;
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const posX = parseFloat(formData.get('positionX') as string);
    const posY = parseFloat(formData.get('positionY') as string);
    const rotation = parseFloat(formData.get('rotation') as string);
    const imageFile = formData.get('image') as File | null;
    if (!spaceId || !content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 });
    const space = await getSpaceById(spaceId);
    if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `notes/${spaceId}/${fileName}`;
      const { error: uploadErr } = await supabaseAdmin.storage.from('diary-images').upload(filePath, imageFile, { contentType: imageFile.type });
      if (!uploadErr) {
        const { data } = supabaseAdmin.storage.from('diary-images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }
    const note = await createNote({
      space_id: spaceId, author_id: user.userId, content: content.trim(),
      color: color || 'yellow', tags, position_x: posX, position_y: posY, rotation,
      image_url: imageUrl,
    });
    if (!note) return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
