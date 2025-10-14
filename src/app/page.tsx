
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MainApp } from '@/components/main-app';
import { validateSession } from '@/app/actions';

export default async function Home() {
  const username = cookies().get('username')?.value;
  const uid = cookies().get('uid')?.value;

  if (!username || !uid) {
    redirect('/login');
  }

  const validation = await validateSession(uid);

  if (validation.status !== 'valid') {
     // Clear invalid cookies and redirect
    cookies().delete('username');
    cookies().delete('uid');
    redirect('/login');
  }

  return <MainApp username={username} />;
}
