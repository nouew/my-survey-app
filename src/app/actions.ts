'use server';

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'user_session';
const USERNAME_COOKIE_NAME = 'username';

export async function createSession(uid: string, username: string) {
  cookies().set(SESSION_COOKIE_NAME, uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
  cookies().set(USERNAME_COOKIE_NAME, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });
}

export async function clearSession() {
  cookies().delete(SESSION_COOKIE_NAME);
  cookies().delete(USERNAME_COOKIE_NAME);
}
