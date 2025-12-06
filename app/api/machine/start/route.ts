import { NextResponse } from 'next/server';
import { startMachine } from '@/services/machine';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const data = await startMachine(id);
    return NextResponse.json({ success: true, machine: data });
  } catch (err) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
