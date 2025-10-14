import { MainApp } from '@/components/main-app';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// This function verifies the session cookie on the server-side.
// It needs the admin SDK, so it must be configured with credentials.
// But we will handle the error gracefully.
async function verifySession() {
  const sessionCookie = cookies().get('user_session')?.value;
  if (!sessionCookie) return { user: null };

  // Initialize admin app if not already initialized
  if (!getApps().length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    // Gracefully handle missing service account key
    if (!serviceAccountKey) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side session verification is disabled.");
        // We will rely on the client-side check in this case.
        // We can decode the token to get the UID for client-side hydration,
        // but we won't be able to verify its signature on the server.
        return { user: null, requiresClientSideVerification: true };
    }
    initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
    });
  }

  try {
    // This will fail if the key is not present, caught by the outer try-catch
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
    return { user: decodedClaims };
  } catch (error) {
    // Could be expired or invalid. Client will handle re-auth.
    console.error('Session cookie verification failed:', error);
    return { user: null };
  }
}


export default async function Home() {
  const cookieStore = cookies();
  const session = cookieStore.get('user_session')?.value;
  const username = cookieStore.get('username')?.value;

  if (!session || !username) {
    redirect('/login');
  }

  return <MainApp username={username} />;
}
