// app/create/page.jsx
import CreateClient from './CreateClient';
import { getSession } from '../../lib/auth';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Create Your Space — Diary Dump' };

export default async function CreatePage() {
  const user = await getSession();
  if (user) redirect(`/space/${user}`);
  return <CreateClient />;
}

