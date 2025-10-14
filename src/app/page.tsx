import { MainApp } from '@/components/main-app';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = cookies();
  const username = cookieStore.get('username')?.value;

  if (!username) {
    redirect('/login');
  }

  return <MainApp username={username} />;
}
