import { notFound } from 'next/navigation';
import { getSpaceBySlug, getNotesBySpaceId } from '@/lib/dal';
import { NoteWall } from '@/components/note-wall';

export default async function SpacePage({ params }: { params: { slug: string } }) {
  const space = await getSpaceBySlug(params.slug);
  if (!space) notFound();
  const notes = await getNotesBySpaceId(space.id);
  return <NoteWall space={space} initialNotes={notes} />;
}
