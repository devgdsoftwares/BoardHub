import { NextResponse } from 'next/server';
import connectDB from '@/models/db';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
const Board = require('@/models/Board');

export async function GET(req) {
  await connectDB();
  // Parse session cookie
  const cookieHeader = (await cookies()).get('session')?.value;
  let userId;
  if (cookieHeader) {
    try {
      const session = JSON.parse(cookieHeader);
      userId = session.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
  }
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  try {
    const boards = await Board.find({ owner: userId });
    return NextResponse.json({ boards });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch boards', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  const cookieHeader = (await cookies()).get('session')?.value;
  let userId;
  if (cookieHeader) {
    try {
      const session = JSON.parse(cookieHeader);
      userId = session.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
  }
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { title } = await req.json();
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  try {
    const board = await Board.create({ title, owner: userId, members: [userId], lists: [] });
    return NextResponse.json({ board });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create board', details: err.message }, { status: 500 });
  }
} 