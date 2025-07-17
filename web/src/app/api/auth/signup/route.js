import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/models/db';
const User = require('@/models/User');

export async function POST(req) {
  await connectDB();
  const { username, email, password } = await req.json();
  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    return NextResponse.json({ message: 'Signup successful', user: { username: user.username, email: user.email, id: user._id } });
  } catch (err) {
    return NextResponse.json({ error: 'Signup failed', details: err.message }, { status: 500 });
  }
} 