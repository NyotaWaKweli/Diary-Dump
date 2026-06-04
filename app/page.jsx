// app/page.jsx
import dynamic from 'next/dynamic';
import { getSession } from '../lib/auth';

const Wall = dynamic(() => import('../components/Wall'), { ssr: false });

export default async function Home() {
  const currentUser = await getSession();
  return <Wall currentUser={currentUser} />;
}
