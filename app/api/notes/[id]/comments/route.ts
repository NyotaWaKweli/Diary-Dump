import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createComment, getCommentsByNoteId, getNoteById } from '@/lib/dal';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comments = await getCommentsByNoteId(params.id);
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Comment required' }, { status: 400 });
    const note = await getNoteById(params.id);
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    const comment = await createComment({ note_id: params.id, author_id: user.userId, content: content.trim() });
    if (!comment) return NextResponse.json({ error: 'Failed' }, { status: 500 });
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
