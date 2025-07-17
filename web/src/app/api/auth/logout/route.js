import { NextResponse } from 'next/server';
import cookie from 'cookie';

export async function POST() {
  const expiredCookie = cookie.serialize('session', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'lax',
  });
  const res = NextResponse.json({ message: 'Logged out' });
  res.headers.set('Set-Cookie', expiredCookie);
  return res;
} 