import { NextResponse } from 'next/server';
import { getMachineFromService, computeStatus } from '@/services/machine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // accept either ?id= or ?machine=
    const id = searchParams.get('id') || searchParams.get('machine');
    if (!id) {
      console.error('STATUS API: missing id/machine param', req.url);
      return NextResponse.json({ success: false, error: 'id or machine param required' }, { status: 400 });
    }

    const doc = await getMachineFromService(id);
    if (!doc) {
      console.warn('STATUS API: machine not found', id);
      return NextResponse.json({ success: false, error: 'machine not found' }, { status: 404 });
    }

    const status = computeStatus(doc);
    return NextResponse.json({ success: true, status, machine: doc }, { status: 200 });
  } catch (err) {
    console.error('STATUS API ERROR:', err);
    return NextResponse.json({ success: false, error: 'internal' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.machine) {
      return NextResponse.json({ success: false, error: 'machine required in body' }, { status: 400 });
    }
    const status = computeStatus(body.machine);
    return NextResponse.json({ success: true, status }, { status: 200 });
  } catch (err) {
    console.error('STATUS POST ERROR:', err);
    return NextResponse.json({ success: false, error: 'internal' }, { status: 500 });
  }
}
