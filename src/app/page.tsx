
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MainApp } from '@/components/main-app';
import { validateActivationKey } from '@/app/actions';

export default async function Home() {
  const username = cookies().get('username')?.value;
  const activationKey = cookies().get('activationKey')?.value;

  if (!username || !activationKey) {
    redirect('/login');
  }

  const validation = await validateActivationKey(username, activationKey);

  if (validation.status !== 'valid') {
     // Clear invalid cookies and redirect
    cookies().delete('username');
    cookies().delete('activationKey');
    redirect('/login');
  }

  return <MainApp username={username} />;
}
