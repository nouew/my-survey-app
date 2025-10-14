
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MainApp } from '@/components/main-app';

export default async function Home() {
  const username = cookies().get('username')?.value;
  const uid = cookies().get('uid')?.value;

  // If cookies are missing, the user is not logged in.
  if (!username || !uid) {
    redirect('/login');
  }

  // If cookies are present, we trust the middleware has done its job
  // and the user is allowed to see the main application.
  return <MainApp username={username} />;
}
