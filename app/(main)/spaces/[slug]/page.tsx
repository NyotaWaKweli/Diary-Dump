import { notFound } from 'next/navigation';
import { getSpaceBySlug, getNotesBySpaceId, isSpaceMember, isSpaceFollower, incrementSpaceVisits } from '@/lib/dal';
import { getCurrentUser } from '@/lib/auth';
import { NoteWall } from '@/components/note-wall';

export default async function SpacePage({ params }: { params: { slug: string } }) {
  const space = await getSpaceBySlug(params.slug);
  if (!space) notFound();

  await incrementSpaceVisits(space.id);
  
  const notes = await getNotesBySpaceId(space.id, 30);
  const user = await getCurrentUser();
  
  const isMember = user ? await isSpaceMember(space.id, user.userId) : false;
  const isFollowing = user ? await isSpaceFollower(space.id, user.userId) : false;

  return (
    <NoteWall 
      space={space} 
      initialNotes={notes} 
      isMember={isMember}
      isFollowing={isFollowing}
      currentUserId={user?.userId}
    />
  );
}
