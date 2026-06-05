import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteNote, getNoteById } from '@/lib/dal';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const note = await getNoteById(params.id);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.author_id !== user.userId) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    const success = await deleteNote(params.id);
    if (!success) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
