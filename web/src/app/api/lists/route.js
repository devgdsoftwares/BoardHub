import { NextResponse } from 'next/server';
import connectDB from '@/models/db';
import { cookies } from 'next/headers';
const List = require('@/models/List');
const Board = require('@/models/Board');

function getUserId() {
  const cookieHeader = cookies().get('session')?.value;
  if (!cookieHeader) return null;
  try {
    return JSON.parse(cookieHeader).userId;
  } catch {
    return null;
  }
}

export async function GET(req) {
  await connectDB();
  const boardId = req.nextUrl.searchParams.get('boardId');
  if (!boardId) return NextResponse.json({ error: 'Missing boardId' }, { status: 400 });
  try {
    const lists = await List.find({ board: boardId });
    return NextResponse.json({ lists });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch lists', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  const userId = getUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { title, boardId, position } = await req.json();
  if (!title || !boardId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  try {
    const list = await List.create({ title, board: boardId, position });
    await Board.findByIdAndUpdate(boardId, { $push: { lists: list._id } });
    return NextResponse.json({ list });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create list', details: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();
  const userId = getUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { listId, title, position } = await req.json();
  if (!listId) return NextResponse.json({ error: 'Missing listId' }, { status: 400 });
  try {
    const list = await List.findByIdAndUpdate(listId, { title, position }, { new: true });
    return NextResponse.json({ list });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update list', details: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();
  const userId = getUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { listId, boardId } = await req.json();
  if (!listId || !boardId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  try {
    await List.findByIdAndDelete(listId);
    await Board.findByIdAndUpdate(boardId, { $pull: { lists: listId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete list', details: err.message }, { status: 500 });
  }
} 