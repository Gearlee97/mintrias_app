import { NextResponse } from 'next/server';
import { claimMachineRewards } from '@/services/machine';

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const result = await claimMachineRewards(id);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
