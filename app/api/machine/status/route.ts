import { NextResponse } from 'next/server';
import { getMachineFromService, computeStatus } from '@/lib/machineService';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const doc = await getMachineFromService(id);
    if (!doc) return NextResponse.json({ error: 'machine not found' }, { status: 404 });

    const status = computeStatus(doc);
    return NextResponse.json({ success: true, status, machine: doc });
  } catch (err) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const status = computeStatus(body.machine);
    return NextResponse.json({ success: true, status });
  } catch (err) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
