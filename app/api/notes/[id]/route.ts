import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getNoteById, updateNote, deleteNote, incrementNoteViews } from '@/lib/dal';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const note = await getNoteById(params.id);
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    await incrementNoteViews(params.id);
    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const note = await getNoteById(params.id);
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (note.author_id !== user.userId) return NextResponse.json({ error: 'Not yours' }, { status: 403 });

    const updates = await request.json();
    const success = await updateNote(params.id, updates);
    
    if (!success) return NextResponse.json({ error: 'Failed' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const note = await getNoteById(params.id);
    if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (note.author_id !== user.userId) return NextResponse.json({ error: 'Not yours' }, { status: 403 });

    const success = await deleteNote(params.id);
    if (!success) return NextResponse.json({ error: 'Failed' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
