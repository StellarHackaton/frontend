import { NextRequest, NextResponse } from 'next/server';
import { getMerchant, upsertMerchant } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });
  const merchant = await getMerchant(address);
  return NextResponse.json({ merchant });
}

export async function POST(req: NextRequest) {
  const { address, storeName } = await req.json() as { address: string; storeName: string };
  if (!address || !storeName?.trim()) {
    return NextResponse.json({ error: 'address and storeName required' }, { status: 400 });
  }
  const merchant = await upsertMerchant(address, storeName.trim());
  return NextResponse.json({ merchant });
}
