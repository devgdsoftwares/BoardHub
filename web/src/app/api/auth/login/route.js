import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import connectDB from '@/models/db';
const User = require('@/models/User');

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // Set session cookie (simple, not secure for prod)
    const session = { userId: user._id, username: user.username };
    const sessionCookie = serialize('session', JSON.stringify(session), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    });
    const res = NextResponse.json({ message: 'Login successful', user: { username: user.username, email: user.email, id: user._id } });
    res.headers.set('Set-Cookie', sessionCookie);
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Login failed', details: err.message }, { status: 500 });
  }
} 