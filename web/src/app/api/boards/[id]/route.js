import { NextResponse } from 'next/server';
import connectDB from '@/models/db';
import { cookies } from 'next/headers';
const Board = require('@/models/Board');

function getUserId(cookieHeader) {
  if (!cookieHeader) return null;
  try {
    return JSON.parse(cookieHeader).userId;
  } catch {
    return null;
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const cookieHeader = (await cookies()).get('session')?.value;
  const userId = getUserId(cookieHeader);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { title } = await req.json();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  try {
    const board = await Board.findOneAndUpdate({ _id: params.id, owner: userId }, { title }, { new: true });
    if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    return NextResponse.json({ board });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update board', details: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  const cookieHeader = (await cookies()).get('session')?.value;
  const userId = getUserId(cookieHeader);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const board = await Board.findOneAndDelete({ _id: params.id, owner: userId });
    if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete board', details: err.message }, { status: 500 });
  }
} 