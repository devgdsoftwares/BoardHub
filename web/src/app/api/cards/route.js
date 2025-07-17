import { NextResponse } from 'next/server';
import connectDB from '@/models/db';
import { cookies } from 'next/headers';
const Card = require('@/models/Card');
const List = require('@/models/List');

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
  const listId = req.nextUrl.searchParams.get('listId');
  if (!listId) return NextResponse.json({ error: 'Missing listId' }, { status: 400 });
  try {
    const cards = await Card.find({ list: listId });
    return NextResponse.json({ cards });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch cards', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  const userId = getUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { title, description, listId, position } = await req.json();
  if (!title || !listId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  try {
    const card = await Card.create({ title, description, list: listId, position });
    await List.findByIdAndUpdate(listId, { $push: { cards: card._id } });
    return NextResponse.json({ card });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create card', details: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();
  const userId = getUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { cardId, title, description, position } = await req.json();
  if (!cardId) return NextResponse.json({ error: 'Missing cardId' }, { status: 400 });
  try {
    const card = await Card.findByIdAndUpdate(cardId, { title, description, position }, { new: true });
    return NextResponse.json({ card });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update card', details: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();
  const userId = getUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { cardId, listId } = await req.json();
  if (!cardId || !listId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  try {
    await Card.findByIdAndDelete(cardId);
    await List.findByIdAndUpdate(listId, { $pull: { cards: cardId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete card', details: err.message }, { status: 500 });
  }
} 