import { NextRequest, NextResponse } from 'next/server';
import { createFeedback } from '@/lib/dal';

export async function POST(request: NextRequest) {
  try {
    const { name, email, content, image_url, is_anonymous } = await request.json();
    
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Feedback content required' }, { status: 400 });
    }

    const success = await createFeedback({
      name: name || '',
      email: email || '',
      content: content.trim(),
      image_url,
      is_anonymous: is_anonymous ?? true,
    });

    if (!success) return NextResponse.json({ error: 'Failed' }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
