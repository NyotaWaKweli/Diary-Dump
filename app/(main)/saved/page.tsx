import { getCurrentUser } from '@/lib/auth';
import { SavedNotesPage } from '@/components/saved-notes-page';
import { redirect } from 'next/navigation';

export default async function SavedNotes() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  
  return <SavedNotesPage userId={user.userId} />;
}
