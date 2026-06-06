import { getCurrentUser } from '@/lib/auth';
import { NotificationsPage } from '@/components/notifications-page';
import { redirect } from 'next/navigation';

export default async function Notifications() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  
  return <NotificationsPage userId={user.userId} />;
}
