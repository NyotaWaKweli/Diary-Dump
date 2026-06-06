import { getCurrentUser } from '@/lib/auth';
import { SettingsPage } from '@/components/settings-page';

export default async function Settings() {
  const user = await getCurrentUser();
  return <SettingsPage currentUser={user} />;
}
