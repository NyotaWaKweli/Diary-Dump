import dynamic from 'next/dynamic';

// Wall uses browser APIs (pointer events, sessionStorage, Firestore)
// so we load it client-side only — no SSR
const Wall = dynamic(() => import('../components/Wall'), { ssr: false });

export default function Home() {
  return <Wall />;
}

